type QuestionDatasetDefinition = {
  id: string;
  label: string;
  description: string;
  fileName: string;
  defaultChunkSize: number;
  load: () => Promise<unknown[]>;
};

const datasetDefinitions = {
  medical: {
    id: 'medical',
    label: 'Medical Platform',
    description: 'AIIMS entrance and medical readiness question bank.',
    fileName: 'questions/medical.json',
    defaultChunkSize: 1000,
    load: async (): Promise<unknown[]> => {
      const module = await import('../../db/quiz/questions/medical.json');
      const data = module.default ?? module;
      return Array.isArray(data) ? data : [];
    },
  },
  engineering: {
    id: 'engineering',
    label: 'Engineering Platform',
    description: 'Engineering entrance and technical aptitude question bank.',
    fileName: 'questions/engineering.json',
    defaultChunkSize: 1000,
    load: async (): Promise<unknown[]> => {
      const module = await import('../../db/quiz/questions/engineering.json');
      const data = module.default ?? module;
      return Array.isArray(data) ? data : [];
    },
  },
} as const satisfies Record<string, QuestionDatasetDefinition>;

export type QuestionDatasetKey = keyof typeof datasetDefinitions;
export type QuestionDatasetDefinition = (typeof datasetDefinitions)[QuestionDatasetKey];
export type QuestionDatasetMeta = Omit<QuestionDatasetDefinition, 'load'>;

export const questionDatasetDefinitions = datasetDefinitions;

export const questionDatasetMetadata: QuestionDatasetMeta[] = Object.values(datasetDefinitions).map(
  ({ load, ...meta }) => meta,
);

export const loadQuestionDataset = async (id: QuestionDatasetKey): Promise<unknown[]> => {
  const definition = datasetDefinitions[id];
  if (!definition) {
    throw new Error(`Unknown dataset "${id}"`);
  }
  const data = await definition.load();
  return Array.isArray(data) ? data : [];
};
