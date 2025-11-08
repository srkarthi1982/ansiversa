export type ResumeBuilderStepKey = 'basics' | 'experience' | 'education' | 'skills' | 'links';

export const resumeBuilderSteps: Array<{ key: ResumeBuilderStepKey; label: string }> = [
  { key: 'basics', label: 'Basics' },
  { key: 'experience', label: 'Experience' },
  { key: 'education', label: 'Education' },
  { key: 'skills', label: 'Skills' },
  { key: 'links', label: 'Links' },
];
