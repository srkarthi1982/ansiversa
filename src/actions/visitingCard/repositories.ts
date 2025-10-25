import { VisitingCard } from 'astro:db';
import { BaseRepository } from '../baseRepository';

class VisitingCardRepository extends BaseRepository<typeof VisitingCard> {}

export const visitingCardRepository = new VisitingCardRepository(VisitingCard);
