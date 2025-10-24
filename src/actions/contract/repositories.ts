import { Contract, ContractClauseLibrary } from 'astro:db';
import { BaseRepository } from '../baseRepository';

export const contractRepository = new BaseRepository(Contract);
export const contractClauseLibraryRepository = new BaseRepository(ContractClauseLibrary);
