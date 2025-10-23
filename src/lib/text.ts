export const sentenceCase = (input: string) => {
  const lower = input.trim();
  if (!lower) return '';
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export const wordCount = (input: string) => {
  const matches = input.trim().match(/\b\w+\b/g);
  return matches ? matches.length : 0;
};

export const charCount = (input: string) => input.length;
