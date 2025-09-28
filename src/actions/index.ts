// src/actions/index.ts
import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, User, PasswordResetToken, eq, or } from 'astro:db';
import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// ---------- helpers ----------
function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${key}`;
}

function verifyPassword(password: string, hash: string) {
  const [salt, keyHex] = hash.split(':');
  if (!salt || !keyHex) return false;
  const derived = scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (keyBuf.length !== derived.length) return false;
  return timingSafeEqual(derived, keyBuf);
}

function toBool(v: unknown) {
  return v === 'on' || v === true || v === 'true';
}

async function findUserByIdentifier(identifier: string) {
  const rows = await db
    .select()
    .from(User)
    .where(or(eq(User.username, identifier), eq(User.email, identifier)));
  return rows[0];
}

async function findUserByUsername(username: string) {
  const rows = await db.select().from(User).where(eq(User.username, username));
  return rows[0];
}

async function findUserByEmail(email: string) {
  const rows = await db.select().from(User).where(eq(User.email, email));
  return rows[0];
}

// ---------- actions ----------
export const server = {
  auth: {
    // REGISTER
    register: defineAction({
      accept: 'form',
      input: z
        .object({
          username: z.string().min(3, 'Username must be at least 3 characters'),
          email: z.string().email('Please enter a valid email'),
          password: z.string().min(6, 'Password must be at least 6 characters'),
          confirm: z.string().min(6),
          remember: z.preprocess(toBool, z.boolean()).optional().default(false),
          terms: z.preprocess(toBool, z.boolean()).optional().default(false),
        })
        .refine((data) => data.password === data.confirm, {
          path: ['confirm'],
          message: 'Passwords do not match',
        })
        .refine((data) => data.terms, {
          path: ['terms'],
          message: 'You must accept the Terms',
        }),
      async handler({ username, email, password, remember }, ctx) {
        // Uniqueness checks
        if (await findUserByUsername(username)) {
          throw new ActionError({ code: 'BAD_REQUEST', message: 'Username already exists' });
        }
        if (await findUserByEmail(email)) {
          throw new ActionError({ code: 'BAD_REQUEST', message: 'Email already in use' });
        }

        const userId = randomUUID();
        const passwordHash = hashPassword(password);
        await db.insert(User).values({ id: userId, username, email, passwordHash });

        // simple session cookie (replace with signed/JWT session if needed)
        const token = `sess-${randomUUID()}`;
        ctx.cookies.set('session', token, {
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          secure: true,
          maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
        });

        return { ok: true, user: { id: userId, username, email } };
      },
    }),

    // LOGIN (username OR email)
    login: defineAction({
      accept: 'form',
      input: z.object({
        identifier: z.string().min(1, 'Enter username or email'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        remember: z.preprocess(toBool, z.boolean()).optional().default(false),
      }),
      async handler({ identifier, password, remember }, ctx) {
        const user = await findUserByIdentifier(identifier);
        if (!user || !verifyPassword(password, user.passwordHash)) {
          throw new ActionError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
        }

        const token = `sess-${randomUUID()}`;
        ctx.cookies.set('session', token, {
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          secure: true,
          maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
        });

        return { ok: true, user: { id: user.id, username: user.username, email: user.email } };
      },
    }),

    // FORGOT PASSWORD (issue reset token and "send" it)
    forgotPassword: defineAction({
      accept: 'form',
      input: z.object({
        email: z.string().email('Please enter a valid email'),
      }),
      async handler({ email }) {
        const user = await findUserByEmail(email);
        // Always return success (avoid leaking which emails exist)
        if (user) {
          const token = randomUUID(); // for prod, consider hashing this before storing
          const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
          await db.insert(PasswordResetToken).values({
            id: randomUUID(),
            userId: user.id,
            token,
            expiresAt,
          });

          // TODO: send email with reset link containing the token
          // e.g. https://www.ansiversa.com/reset-password?token=${token}
        }
        return { ok: true };
      },
    }),

    // RESET PASSWORD (consumes token)
    resetPassword: defineAction({
      accept: 'form',
      input: z
        .object({
          token: z.string().min(1, 'Missing token'),
          password: z.string().min(6, 'Password must be at least 6 characters'),
          confirm: z.string().min(6),
        })
        .refine((d) => d.password === d.confirm, {
          path: ['confirm'],
          message: 'Passwords do not match',
        }),
      async handler({ token, password }) {
        const rows = await db
          .select()
          .from(PasswordResetToken)
          .where(eq(PasswordResetToken.token, token));
        const record = rows[0];

        if (!record || record.usedAt || record.expiresAt < new Date()) {
          throw new ActionError({ code: 'UNAUTHORIZED', message: 'Invalid or expired token' });
        }

        const userRows = await db.select().from(User).where(eq(User.id, record.userId));
        const user = userRows[0];
        if (!user) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'User not found' });
        }

        const newHash = hashPassword(password);
        await db.update(User).set({ passwordHash: newHash }).where(eq(User.id, user.id));
        await db
          .update(PasswordResetToken)
          .set({ usedAt: new Date() })
          .where(eq(PasswordResetToken.id, record.id));

        return { ok: true };
      },
    }),

    // CHANGE PASSWORD (authenticated flow or with username + old password)
    changePassword: defineAction({
      accept: 'form',
      input: z
        .object({
          identifier: z.string().min(1, 'Enter username or email'),
          oldPassword: z.string().min(6),
          newPassword: z.string().min(6, 'Password must be at least 6 characters'),
          confirm: z.string().min(6),
        })
        .refine((d) => d.newPassword === d.confirm, {
          path: ['confirm'],
          message: 'Passwords do not match',
        }),
      async handler({ identifier, oldPassword, newPassword }) {
        const user = await findUserByIdentifier(identifier);
        if (!user || !verifyPassword(oldPassword, user.passwordHash)) {
          throw new ActionError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
        }
        const newHash = hashPassword(newPassword);
        await db.update(User).set({ passwordHash: newHash }).where(eq(User.id, user.id));
        return { ok: true };
      },
    }),
  },
};
