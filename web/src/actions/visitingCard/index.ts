import { generateTagline } from './generateTagline';
import { save } from './save';
import { list } from './list';
import { remove } from './delete';
import { exportCard } from './export';

export const card = {
  generateTagline,
  save,
  list,
  delete: remove,
  export: exportCard,
};

export const visitingCard = card;
