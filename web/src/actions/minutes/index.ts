import { create } from './create';
import { list } from './list';
import { get } from './get';
import { save } from './save';
import { transcribe } from './transcribe';
import { summarize } from './summarize';
import { exportMinutes } from './export';
import { publish } from './publish';
import { remove } from './delete';
import { templates } from './templates';

export const minutes = {
  create,
  list,
  get,
  save,
  transcribe,
  summarize,
  export: exportMinutes,
  publish,
  delete: remove,
  templates,
};

