type QuestionDatasetConfig = {
  id: string;
  label: string;
  description: string;
  fileName: string;
  defaultChunkSize: number;
  load: () => Promise<unknown[]>;
};

const questionFileModules = import.meta.glob('../../db/quiz/questions/*.json');

const toDatasetId = (value: string) =>
  value
    .toLowerCase()
    .replace(/\.json$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toDatasetLabel = (value: string) =>
  value
    .replace(/\.json$/i, '')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s*&\s*/g, ' & ')
    .replace(/\s+/g, ' ')
    .trim();

const datasetEntries = Object.entries(questionFileModules).map(([path, loader]) => {
  const fileName = path.split('/').pop() ?? path;
  const baseLabel = toDatasetLabel(fileName) || fileName.replace(/\.json$/i, '');
  const id = toDatasetId(fileName) || toDatasetId(baseLabel) || baseLabel.toLowerCase();
  return [
    id,
    {
      id,
      label: baseLabel,
      description: `${baseLabel} question dataset`,
      fileName: `questions/${fileName}`,
      defaultChunkSize: 1000,
      load: async (): Promise<unknown[]> => {
        const module = await loader();
        const data = module.default ?? module;
        return Array.isArray(data) ? data : [];
      },
    } satisfies QuestionDatasetConfig,
  ] as const;
});

datasetEntries.sort((a, b) => a[1].label.localeCompare(b[1].label));

const datasetDefinitions = Object.fromEntries(datasetEntries) as Record<string, QuestionDatasetConfig>;

export type QuestionDatasetKey = keyof typeof datasetDefinitions;
export type QuestionDatasetDefinition = QuestionDatasetConfig;
export type QuestionDatasetMeta = Omit<QuestionDatasetConfig, 'load'>;

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
