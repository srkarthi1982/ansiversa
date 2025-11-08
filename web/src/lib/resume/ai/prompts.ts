type Tone = 'concise' | 'professional' | 'friendly';

const toneInstructions: Record<Tone, string> = {
  concise: 'Keep it crisp, focus on impact, limit to 80 words.',
  professional: 'Use confident, results-oriented language with measurable outcomes.',
  friendly: 'Keep it approachable while highlighting strengths.',
};

export const buildSummaryPrompt = (text: string, tone: Tone = 'professional'): string => `
Rewrite the following resume summary to be ${toneInstructions[tone]}
Input:
${text}

Requirements:
- Maintain first-person implied tone (no "I").
- Replace buzzwords with specific impact statements.
- Return plain text without markdown.
`.trim();

export const buildExperiencePrompt = (text: string): string => `
Improve this resume bullet. Requirements:
- Start with a strong action verb.
- Quantify impact with metrics if available.
- Keep under 220 characters.
- Remove filler words.

Bullet:
${text}
`.trim();

export const buildSkillPrompt = (skills: string): string => `
Normalize this raw list of skills. Requirements:
- Remove duplicates.
- Standardize naming (e.g., JavaScript instead of JS).
- Group into 3 categories: Languages, Frameworks, Tools.
- Return JSON: { languages: [], frameworks: [], tools: [] }

Skills:
${skills}
`.trim();
