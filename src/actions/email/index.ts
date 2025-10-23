import { list } from './list';
import { get } from './get';
import { create } from './create';
import { save } from './save';
import { remove } from './delete';
import { duplicate } from './duplicate';
import { templates } from './templates';
import { signature } from './signature';
import { polish } from './polish';
import { reply } from './reply';
import { summarize } from './summarize';
import { rewrite } from './rewrite';
import { translate } from './translate';
import { renderTemplate } from './render-template';

export const email = {
  list,
  get,
  create,
  save,
  delete: remove,
  duplicate,
  templates,
  signature,
  polish,
  reply,
  summarize,
  rewrite,
  translate,
  renderTemplate,
};

export {
  list,
  get,
  create,
  save,
  remove,
  duplicate,
  templates,
  signature,
  polish,
  reply,
  summarize,
  rewrite,
  translate,
  renderTemplate,
};
