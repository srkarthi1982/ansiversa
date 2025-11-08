import nodemailer from 'nodemailer';

type VerificationEmailParams = {
  to: string;
  username: string;
  verificationUrl: string;
};

type TemporaryPasswordEmailParams = {
  to: string;
  username: string;
  temporaryPassword: string;
};

const FROM_EMAIL = process.env.GMAIL_USER ?? 'ansiversa@gmail.com';
const FROM_DISPLAY = `Ansiversa <${FROM_EMAIL}>`;
const GMAIL_PASSWORD = process.env.GMAIL_APP_PASSWORD ?? process.env.GMAIL_PASSWORD;

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

async function getTransporter() {
  if (!GMAIL_PASSWORD) {
    console.warn(
      '[mail] Missing Gmail credentials. Set GMAIL_APP_PASSWORD (or GMAIL_PASSWORD) in the environment.',
    );
    throw new Error('Missing Gmail credentials');
  }

  if (!transporterPromise) {
    transporterPromise = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,           // or 587 with secure: false
        secure: true,
      auth: {
        user: FROM_EMAIL,
        pass: GMAIL_PASSWORD,
      },
    });
  }

  return transporterPromise;
}

export async function sendVerificationEmail({
  to,
  username,
  verificationUrl,
}: VerificationEmailParams) {
  const subject = 'Verify your Ansiversa account';
  const textBody = [
    `Hi ${username},`,
    '',
    'Thanks for signing up for Ansiversa!',
    'Please confirm your email address by clicking the link below:',
    verificationUrl,
    '',
    'If you did not create this account, you can safely ignore this email.',
    '',
    '— The Ansiversa Team',
  ].join('\n');

  const htmlBody = `
    <p>Hi ${username},</p>
    <p>Thanks for signing up for Ansiversa! Please confirm your email address by clicking the button below:</p>
    <p><a href="${verificationUrl}" style="display:inline-block;padding:10px 16px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;">Verify email</a></p>
    <p>Or copy and paste this link into your browser:</p>
    <p><a href="${verificationUrl}">${verificationUrl}</a></p>
    <p>If you did not create this account, you can safely ignore this email.</p>
    <p>— The Ansiversa Team</p>
  `;

  try {
    const transporter = await getTransporter();
    await transporter.sendMail({
      from: FROM_DISPLAY,
      to,
      subject,
      text: textBody,
      html: htmlBody,
    });
    console.info(`[mail] Verification email sent to ${to}`);
  } catch (error) {
    console.error('[mail] Failed to send verification email', error);
  }
}

export async function sendTemporaryPasswordEmail({
  to,
  username,
  temporaryPassword,
}: TemporaryPasswordEmailParams) {
  const subject = 'Your Ansiversa temporary password';
  const textBody = [
    `Hi ${username},`,
    '',
    'We received a request to reset your Ansiversa password.',
    'Use the temporary password below to log in:',
    temporaryPassword,
    '',
    'For security, please change your password after signing in.',
    '',
    'If you did not request this change, update your password and let our support team know immediately.',
    '',
    '— The Ansiversa Team',
  ].join('\n');

  const htmlBody = `
    <p>Hi ${username},</p>
    <p>We received a request to reset your Ansiversa password. Use the temporary password below to log in:</p>
    <p style="font-size:20px;font-weight:600;letter-spacing:0.5px;margin:16px 0;">${temporaryPassword}</p>
    <p>For security, please change your password after signing in.</p>
    <p>If you did not request this change, update your password and let our support team know immediately.</p>
    <p>— The Ansiversa Team</p>
  `;

  try {
    const transporter = await getTransporter();
    await transporter.sendMail({
      from: FROM_DISPLAY,
      to,
      subject,
      text: textBody,
      html: htmlBody,
    });
    console.info(`[mail] Temporary password email sent to ${to}`);
  } catch (error) {
    console.error('[mail] Failed to send temporary password email', error);
  }
}
