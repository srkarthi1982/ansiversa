import { CoverLetter } from 'astro:db';
import { BaseRepository } from '../baseRepository';

class CoverLetterRepository extends BaseRepository<typeof CoverLetter> {}

export const coverLetterRepository = new CoverLetterRepository(CoverLetter);
