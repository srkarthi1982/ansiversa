import { EmailDraft, EmailTemplate, EmailSignature, EmailHistory } from 'astro:db';
import { BaseRepository } from '../baseRepository';

export const emailDraftRepository = new BaseRepository(EmailDraft);
export const emailTemplateRepository = new BaseRepository(EmailTemplate);
export const emailSignatureRepository = new BaseRepository(EmailSignature);
export const emailHistoryRepository = new BaseRepository(EmailHistory);
