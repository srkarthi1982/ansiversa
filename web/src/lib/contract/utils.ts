import { slugify } from '../string-utils';
import type { ContractClauses, ContractData, ContractTemplateKey, ContractVariables } from './schema';
import { contractClauseKeys, contractTemplates, defaultContractTitle } from './schema';

export const slugifyContractTitle = (title: string) => {
  const base = title?.trim().length ? title : defaultContractTitle;
  return slugify(base || 'contract');
};

export const describeContractSummary = (data: ContractData | null | undefined) => {
  if (!data) return 'Draft contract';
  const { variables } = data;
  const client = variables.ClientName ?? 'Client';
  const provider = variables.ProviderName ?? 'Provider';
  const start = variables.StartDate ?? '';
  const fee = variables.ServiceFee ? `${variables.Currency ?? ''} ${variables.ServiceFee}`.trim() : '';
  const summaryParts = [
    `${provider} → ${client}`,
    start ? `starts ${start}` : null,
    fee ? `fee ${fee}` : null,
  ].filter(Boolean);
  return summaryParts.join(' • ') || 'Draft contract';
};

export const applyVariablesToClauses = (clauses: ContractClauses, variables: ContractVariables) => {
  const replacements = Object.entries(variables ?? {}).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[`{${key}}`] = value ?? '';
    return acc;
  }, {});

  const replace = (text: string) =>
    Object.entries(replacements).reduce((draft, [token, value]) => draft.replaceAll(token, value), text);

  return contractClauseKeys.reduce<Record<string, string>>((acc, key) => {
    acc[key] = replace(clauses[key] ?? '');
    return acc;
  }, {});
};

export const getTemplateLabel = (key: ContractTemplateKey) =>
  contractTemplates.find((template) => template.key === key)?.label ?? 'Contract';

export const nowIso = () => new Date().toISOString();

export const ensureReadableDate = (value: string | null | undefined) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
