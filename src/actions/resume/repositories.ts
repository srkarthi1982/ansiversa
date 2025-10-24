import { Resume, ResumeExport } from 'astro:db';
import { BaseRepository } from '../baseRepository';

export const resumeRepository = new BaseRepository(Resume);
export const resumeExportRepository = new BaseRepository(ResumeExport);
