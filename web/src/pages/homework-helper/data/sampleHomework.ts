export type HomeworkSubject =
  | 'Math'
  | 'Science'
  | 'English'
  | 'Social Science'
  | 'Programming';

export interface HomeworkStep {
  n: number;
  title: string;
  bodyMd: string;
  hint: string;
  revealed?: boolean;
}

export interface HomeworkCitation {
  title: string;
  url: string;
  tier: 'A' | 'B' | 'C';
}

export interface HomeworkPracticeProblem {
  id: string;
  subject: HomeworkSubject;
  prompt: string;
  answer: string;
  skillFocus: string;
}

export interface HomeworkAttemptFeedback {
  highlight: string;
  feedback: string;
  recommendation: string;
}

export interface HomeworkProblemSnapshot {
  id: string;
  subject: HomeworkSubject;
  gradeBand: '5-8' | '9-10' | '11-12' | 'UG';
  board: 'cbse' | 'intl';
  prompt: string;
  detectedTopic: string;
  difficulty: number;
  steps: HomeworkStep[];
  finalAnswer: {
    value: string;
    units?: string;
    explanation: string;
  };
  citations: HomeworkCitation[];
  attempts: HomeworkAttemptFeedback[];
  practice: HomeworkPracticeProblem[];
}

export const getSampleHomeworkProblem = (): HomeworkProblemSnapshot => ({
  id: 'hw-sample-001',
  subject: 'Math',
  gradeBand: '9-10',
  board: 'cbse',
  prompt:
    'A projectile is launched upwards with an initial velocity of 20 m/s. How long does it take to return to the ground? Assume g = 9.8 m/s².',
  detectedTopic: 'Kinematics — vertical motion under gravity',
  difficulty: 3,
  steps: [
    {
      n: 1,
      title: 'Identify given information',
      bodyMd:
        'Initial velocity $u = 20\\,\\text{m/s}$, acceleration due to gravity $g = 9.8\\,\\text{m/s}^2$ (downwards), displacement $s = 0$ when it returns to ground.',
      hint: 'List what is known and choose the motion equation with time.',
    },
    {
      n: 2,
      title: 'Choose the appropriate equation',
      bodyMd:
        'Use the displacement equation for vertical motion: $s = ut + \\tfrac{1}{2}at^2$. Because the projectile returns to the ground, set $s = 0$ and $a = -g$.',
      hint: 'Which equation links displacement, initial velocity, acceleration, and time?',
    },
    {
      n: 3,
      title: 'Solve for time',
      bodyMd:
        '$0 = 20t - 4.9t^2 \\Rightarrow t(20 - 4.9t) = 0$. The non-zero solution is $t = \\dfrac{20}{4.9} \\approx 4.08\\,\\text{s}$.',
      hint: 'Factor the equation and discard the trivial solution.',
    },
  ],
  finalAnswer: {
    value: '4.08 seconds',
    explanation:
      'The projectile spends roughly 2.04 seconds ascending and 2.04 seconds descending, so the total flight time is about 4.08 seconds.',
  },
  citations: [
    {
      title: 'NCERT Class 11 Physics — Motion in a Straight Line',
      url: 'https://ncert.nic.in/textbook.php?kepy1=1-9',
      tier: 'A',
    },
    {
      title: 'HyperPhysics: Vertical Motion',
      url: 'http://hyperphysics.phy-astr.gsu.edu/hbase/traj.html',
      tier: 'B',
    },
  ],
  attempts: [
    {
      highlight: 'Used $g = 10$ m/s² and got $t = 4$ s',
      feedback: 'Approximation is acceptable, but annotate when you round constants to maintain precision expectations.',
      recommendation: 'Mention the assumption or rerun with $g = 9.8$ m/s² for higher accuracy.',
    },
    {
      highlight: 'Forgot the negative sign for acceleration',
      feedback:
        'Setting $a = +9.8$ m/s² reverses the direction and yields an extraneous solution. Always align sign convention with chosen direction.',
      recommendation: 'State “upward positive” in your setup and keep $g$ negative in the equation.',
    },
  ],
  practice: [
    {
      id: 'practice-physics-1',
      subject: 'Science',
      prompt: 'A ball is thrown straight up with initial velocity 12 m/s. How high does it travel? Assume $g = 9.8$ m/s².',
      answer: 'Reach height $h = 7.35$ m using $v^2 = u^2 + 2as$ with $v = 0$ at peak.',
      skillFocus: 'Energy/kinematics bridge',
    },
    {
      id: 'practice-math-1',
      subject: 'Math',
      prompt: 'Solve the quadratic equation $2x^2 - 5x - 3 = 0$ using the quadratic formula.',
      answer: 'Roots $x = 3$ and $x = -\\tfrac{1}{2}$. Highlight discriminant evaluation.',
      skillFocus: 'Quadratic solving',
    },
    {
      id: 'practice-programming-1',
      subject: 'Programming',
      prompt: 'Explain what Big-O notation $O(n \\log n)$ implies for an algorithm, and give one example.',
      answer: 'Time grows proportionally to $n$ times $\\log n$; merge sort is a canonical example.',
      skillFocus: 'Complexity reasoning',
    },
  ],
});

export const getHomeworkHighlights = () => ({
  subjects: [
    {
      name: 'Math',
      coverage: 'Arithmetic to Calculus with symbolic rendering',
      icon: 'fas fa-square-root-variable',
    },
    {
      name: 'Science',
      coverage: 'Physics, Chemistry, Biology with units and citations',
      icon: 'fas fa-atom',
    },
    {
      name: 'English',
      coverage: 'Grammar, comprehension, summarisation with evidence',
      icon: 'fas fa-book-open-reader',
    },
    {
      name: 'Social Science',
      coverage: 'History, civics, geography responses with tiered sources',
      icon: 'fas fa-landmark',
    },
    {
      name: 'Programming',
      coverage: 'Algorithm reasoning, code review, pseudo-code guidance',
      icon: 'fas fa-code',
    },
  ],
  guardrails: [
    {
      title: 'Integrity first',
      description: 'We provide hints, scaffolding, and original explanations—never direct copy from solution manuals.',
      icon: 'fas fa-shield-check',
    },
    {
      title: 'Stepwise mastery',
      description: 'Learners reveal steps progressively to encourage independent thinking before seeing full answers.',
      icon: 'fas fa-stairs',
    },
    {
      title: 'Cited knowledge',
      description: 'Science, Social Science, and English answers surface verifiable sources with tier badges.',
      icon: 'fas fa-scroll',
    },
  ],
});
