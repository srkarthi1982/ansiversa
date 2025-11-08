import { list } from './list';
import { get } from './get';
import { create } from './create';
import { save } from './save';
import { duplicate } from './duplicate';
import { remove } from './delete';
import { exportResume } from './export';
import { aiImprove } from './ai-improve';
import { setDefault } from './set-default';

export const resume = {
  list,
  get,
  create,
  save,
  duplicate,
  delete: remove,
  export: exportResume,
  aiImprove,
  setDefault,
};

export {
  list,
  get,
  create,
  save,
  duplicate,
  remove,
  exportResume,
  aiImprove,
  setDefault,
};
