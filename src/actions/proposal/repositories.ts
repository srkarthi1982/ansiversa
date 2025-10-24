import { Proposal } from 'astro:db';
import { BaseRepository } from '../baseRepository';

export const proposalRepository = new BaseRepository(Proposal);
