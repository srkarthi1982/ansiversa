import { aiDraft } from './ai-draft';
import { aiImprove } from './ai-improve';
import { briefAnalyze } from './brief-analyze';
import { create } from './create';
import { duplicate } from './duplicate';
import { exportProposal } from './export';
import { get } from './get';
import { list } from './list';
import { publish } from './publish';
import { remove } from './delete';
import { save } from './save';

export const proposal = {
  create,
  list,
  get,
  save,
  duplicate,
  delete: remove,
  publish,
  export: exportProposal,
  aiDraft,
  aiImprove,
  briefAnalyze,
};
