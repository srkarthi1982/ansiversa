const { randomBytes, scryptSync, timingSafeEqual } = await import('node:crypto');

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${key}`;
}

export function verifyPassword(password: string, hash: string) {
  const [salt, storedKeyHex] = hash.split(':');
  if (!salt || !storedKeyHex) return false;

  const derivedKey = scryptSync(password, salt, 64);
  const storedKey = Buffer.from(storedKeyHex, 'hex');

  if (storedKey.length !== derivedKey.length) return false;
  return timingSafeEqual(storedKey, derivedKey);
}
