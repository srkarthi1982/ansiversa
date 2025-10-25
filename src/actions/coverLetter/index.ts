import { generate } from './generate';
import { improve } from './improve';
import { rewriteTone } from './tone';
import { save } from './save';
import { list } from './list';
import { exportLetter } from './export';

export const coverLetter = {
  generate,
  improve,
  rewriteTone,
  save,
  list,
  export: exportLetter,
};
