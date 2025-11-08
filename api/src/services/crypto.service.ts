import { scrypt, randomBytes, timingSafeEqual } from 'crypto';

export async function hash(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, (err, derivedKey) => err ? reject(err) : resolve(derivedKey));
  });
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

export async function verify(password: string, hashed: string): Promise<boolean> {
  const [saltHex, keyHex] = hashed.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const key = Buffer.from(keyHex, 'hex');
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, (err, dk) => err ? reject(err) : resolve(dk));
  });
  return timingSafeEqual(key, derivedKey);
}
