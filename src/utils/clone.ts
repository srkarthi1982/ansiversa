export const clone = <TValue>(value: TValue): TValue => {
  const structuredCloneFn = (globalThis as typeof globalThis and {
    structuredClone?: <T>(input: T) => T;
  }).structuredClone;

  if (typeof structuredCloneFn === 'function') {
    return structuredCloneFn(value);
  }

  return JSON.parse(JSON.stringify(value));
};

