import { EmailVerificationToken, PasswordResetToken, Session, User } from 'astro:db';
import { BaseRepository } from '../baseRepository';

export const userRepository = new BaseRepository(User);
export const sessionRepository = new BaseRepository(Session);
export const emailVerificationRepository = new BaseRepository(EmailVerificationToken);
export const passwordResetRepository = new BaseRepository(PasswordResetToken);
