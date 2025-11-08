import { aiClause } from './ai-clause';
import { create } from './create';
import { duplicate } from './duplicate';
import { exportContract } from './export';
import { get } from './get';
import { library } from './library';
import { list } from './list';
import { publish } from './publish';
import { remove } from './delete';
import { save } from './save';

export const contract = {
  create,
  list,
  get,
  save,
  duplicate,
  delete: remove,
  publish,
  export: exportContract,
  aiClause,
  library,
};
