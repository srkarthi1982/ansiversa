import { create } from './create';
import { destroy } from './delete';
import { exportNotes } from './export';
import { list } from './list';
import { review } from './review';
import { summarise } from './summarise';
import { update } from './update';

export const flashnote = {
  list,
  create,
  update,
  delete: destroy,
  summarise,
  review,
  export: exportNotes,
};
