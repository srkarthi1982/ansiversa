import { FlashNote } from 'astro:db';
import { BaseRepository } from '../baseRepository';

export const flashNoteRepository = new BaseRepository(FlashNote);
