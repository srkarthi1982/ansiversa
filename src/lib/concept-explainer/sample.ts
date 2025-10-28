import type {
  AudienceLevel,
  ConceptAnalogy,
  ConceptBreakdownStage,
  ConceptExportPreset,
  ConceptMiniQuiz,
  ConceptSnapshot,
  ConceptVisual,
  LinkedWorkspace,
} from '../../types/concept-explainer';

interface ConceptSampleData {
  snapshot: ConceptSnapshot;
  breakdown: ConceptBreakdownStage[];
  analogies: ConceptAnalogy[];
  visuals: ConceptVisual[];
  pitfalls: { title: string; fix: string }[];
  miniQuiz: ConceptMiniQuiz;
  quickChecks: string[];
  exports: ConceptExportPreset[];
  linkedWorkspaces: LinkedWorkspace[];
  defaultContext: {
    level: AudienceLevel;
    style: 'Teacher talk';
    language: string;
    region: string;
    subject: string;
    examTag: string | null;
  };
}

export const getSampleConceptData = (): ConceptSampleData => ({
  snapshot: {
    concept: 'Photosynthesis',
    tagline: 'How plants bottle sunshine into sugar',
    definition:
      'Photosynthesis is the process by which green plants use sunlight, water, and carbon dioxide to create glucose (food) and oxygen.',
    difficulty: 'Beginner',
    effortMinutes: 18,
    prerequisites: ['Basic idea of plant cells', 'Know what sunlight and carbon dioxide are'],
    keyOutcomes: [
      'Explain the light and dark reactions in simple steps',
      'Connect photosynthesis to food chains and oxygen production',
      'Spot common misconceptions like plants only breathing in oxygen at night',
    ],
    keywords: ['chlorophyll', 'stomata', 'glucose', 'sunlight', 'chloroplast'],
  },
  breakdown: [
    {
      id: 'stage-intro',
      title: 'Scene setting',
      summary: 'Plants are solar-powered chefs making sugar meals.',
      keyPoints: [
        'Takes place inside leaf cell kitchens called chloroplasts',
        'Needs sunlight, water from roots, and carbon dioxide from air',
        'Produces glucose for energy storage and oxygen as a bonus gift',
      ],
      levelNotes: {
        Kids: 'Imagine leaves as tiny kitchens that cook sugar whenever the sun is out.',
        Teen: 'Think of chloroplasts as solar panels plus mini chemical factories.',
        Undergrad: 'Link inputs to the Calvin cycle and ATP/NADPH production.',
      },
    },
    {
      id: 'stage-light',
      title: 'Light reaction',
      summary: 'Sunlight excites electrons and splits water to charge batteries.',
      keyPoints: [
        'Photons strike chlorophyll in the thylakoid membranes',
        'Water is split (photolysis) releasing oxygen and electrons',
        'Energy is stored temporarily as ATP and NADPH',
      ],
      levelNotes: {
        Kids: 'Sunlight gives leaves a power-up to split water and breathe out oxygen.',
        Teen: 'Describe the electron transport chain and proton gradient briefly.',
        Professional: 'Include Z-scheme notation and photophosphorylation yield.',
        Expert: 'Reference photosystem II repair cycle and quantum efficiency.',
      },
      example:
        'If a plant sits in shade, the light reaction slows, which means fewer charged batteries (ATP/NADPH) for sugar making.',
    },
    {
      id: 'stage-dark',
      title: 'Calvin cycle',
      summary: 'Enzymes stitch carbon into sugar using the charged carriers.',
      keyPoints: [
        'CO₂ enters the stroma and meets RuBisCO',
        'Carbon atoms loop through reduction and regeneration phases',
        'Three turns build a triose phosphate; six turns make one glucose',
      ],
      levelNotes: {
        Teen: 'Picture carbon atoms going round a recycling loop, picking up energy each time.',
        Undergrad: 'Track ATP/NADPH consumption counts explicitly.',
        Professional: 'Discuss regulation and photorespiration triggers.',
      },
    },
    {
      id: 'stage-impact',
      title: 'Why it matters',
      summary: 'Photosynthesis feeds ecosystems and balances the atmosphere.',
      keyPoints: [
        'Primary source of biomass for almost every food chain',
        'Releases the oxygen animals breathe',
        'Influences climate by capturing atmospheric CO₂',
      ],
      levelNotes: {
        Kids: 'No photosynthesis = no apples, no oxygen, no fun picnics.',
        Professional: 'Quantify gigatonnes of CO₂ sequestered by forests.',
      },
    },
  ],
  analogies: [
    {
      title: 'Solar kitchen story',
      description:
        'Leaves act like a cafe rooftop that soaks up sunshine to cook sugar pancakes while releasing fresh air.',
      level: ['Kids', 'Teen'],
    },
    {
      title: 'Factory line',
      description:
        'Photosynthesis behaves like a two-stage factory: the first line charges batteries, the second assembles sugars.',
      level: ['Teen', 'Undergrad'],
    },
    {
      title: 'Global economy model',
      description:
        'Treat each chloroplast as a micro power plant feeding the carbon market, balancing sinks and sources of CO₂.',
      level: ['Professional', 'Expert'],
    },
  ],
  visuals: [
    {
      title: 'High-level flow',
      ascii: `Sunlight -> [Chlorophyll]\n              |\n         Water + CO2 -> [Chloroplast] -> Glucose + O2`,
      caption: 'Inputs funnel into the chloroplast where reactions convert raw ingredients into sugar and oxygen.',
      highlight: 'Use the diagram to explain direction of energy and matter transfer.',
    },
    {
      title: 'Chloroplast zones',
      ascii:
        `+----------------------+\n|  Thylakoid stacks    |  <- light reaction\n|                      |\n|  Stroma (Calvin)     |  <- dark reaction\n+----------------------+`,
      caption: 'Shows the spatial separation between light-dependent and light-independent reactions.',
      highlight: 'Point out where ATP and NADPH travel inside the organelle.',
    },
  ],
  pitfalls: [
    {
      title: 'Plants breathe oxygen',
      fix: 'Clarify that plants respire all day but net oxygen release is positive while photosynthesising.',
    },
    {
      title: 'Dark reaction needs darkness',
      fix: 'Explain that “dark” only means light-independent; it still relies on light-produced ATP/NADPH.',
    },
    {
      title: 'Sugar appears instantly',
      fix: 'Show how triose phosphates feed into starch/sucrose pathways gradually.',
    },
  ],
  miniQuiz: {
    prompt: 'Which molecule captures sunlight to start the light reaction?',
    options: ['RuBisCO', 'Chlorophyll', 'Glucose', 'Starch'],
    answer: 'Chlorophyll',
    explanation:
      'Chlorophyll pigments in the thylakoid membrane absorb photons, energising electrons to power the rest of the reaction.',
  },
  quickChecks: [
    'Can the learner retell the process in four steps without notes?',
    'Ask them to label inputs and outputs on the flow diagram.',
    'Switch levels: explain photosynthesis to a friend two grades above.',
  ],
  exports: [
    {
      format: 'md',
      description: 'Markdown brief with sections, visuals, and quiz items.',
      estimatedSize: '12 KB',
      updatedAt: '2 min ago',
    },
    {
      format: 'pdf',
      description: 'Printable one-pager for classroom handouts.',
      estimatedSize: '220 KB',
      updatedAt: '5 min ago',
    },
    {
      format: 'json',
      description: 'Structured data for API workflows or FlashNote import.',
      estimatedSize: '6 KB',
      updatedAt: 'Just now',
    },
  ],
  linkedWorkspaces: [
    {
      title: 'FlashNote',
      description: 'Generate bite-sized flashcards from the current explanation.',
      actionLabel: 'Open FlashNote deck',
      href: '/flashnote',
    },
    {
      title: 'Quiz Institute',
      description: 'Send the mini-quiz to craft a 5-question formative check.',
      actionLabel: 'Build quiz set',
      href: '/quiz',
    },
    {
      title: 'Lesson Builder',
      description: 'Drop this concept into a 30-minute guided lesson plan.',
      actionLabel: 'Plan a lesson',
      href: '/lesson-builder',
    },
    {
      title: 'Blog Writer',
      description: 'Expand the concept into a storytelling article for parents.',
      actionLabel: 'Draft blog post',
      href: '/blog-writer',
    },
  ],
  defaultContext: {
    level: 'Teen',
    style: 'Teacher talk',
    language: 'English',
    region: 'CBSE',
    subject: 'Biology',
    examTag: 'Class 10 Board',
  },
});

export type { ConceptSampleData };
