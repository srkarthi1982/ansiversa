import { Minutes, MinutesActionItem, MinutesMedia } from 'astro:db';
import { BaseRepository } from '../baseRepository';

export const minutesRepository = new BaseRepository(Minutes);
export const minutesActionItemRepository = new BaseRepository(MinutesActionItem);
export const minutesMediaRepository = new BaseRepository(MinutesMedia);
