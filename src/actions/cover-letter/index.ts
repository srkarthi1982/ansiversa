import { create } from './create';
import { list } from './list';
import { get } from './get';
import { save } from './save';
import { compose } from './compose';
import { duplicate } from './duplicate';
import { exportLetter } from './export';
import { deleteLetter } from './delete';

export const coverLetter = {
  create,
  list,
  get,
  save,
  compose,
  duplicate,
  export: exportLetter,
  delete: deleteLetter,
};
