const resolveEnv = (key: string) => import.meta.env?.[key as keyof ImportMetaEnv] ?? process.env?.[key];

const remoteUrl =
  resolveEnv('ASTRO_DB_REMOTE_URL') ||
  resolveEnv('ASTRO_DB_URL') ||
  resolveEnv('TURSO_DATABASE_URL');

const remoteToken =
  resolveEnv('ASTRO_DB_APP_TOKEN') ||
  resolveEnv('ASTRO_DB_AUTH_TOKEN') ||
  resolveEnv('TURSO_AUTH_TOKEN');

const databaseConfigured = Boolean(remoteUrl && remoteToken);

type ServerActions = Awaited<ReturnType<typeof loadServerActions>>;

async function loadServerActions() {
  const [
    appModule,
    authModule,
    billingModule,
    cardModule,
    contractModule,
    coverLetterModule,
    emailModule,
    flashnoteModule,
    minutesModule,
    proposalModule,
    quizModule,
    resumeModule,
  ] = await Promise.all([
    import('./app'),
    import('./auth'),
    import('./billing'),
    import('./visitingCard'),
    import('./contract'),
    import('./coverLetter'),
    import('./email'),
    import('./flashnote'),
    import('./minutes'),
    import('./proposal'),
    import('./quiz'),
    import('./resume'),
  ]);

  return {
    auth: authModule.auth,
    app: appModule.app,
    flashnote: flashnoteModule.flashnote,
    quiz: quizModule.quiz,
    resume: resumeModule.resume,
    proposal: proposalModule.proposal,
    contract: contractModule.contract,
    minutes: minutesModule.minutes,
    email: emailModule.email,
    coverLetter: coverLetterModule.coverLetter,
    card: cardModule.card,
    visitingCard: cardModule.visitingCard,
    billing: billingModule.billing,
    'proposal-writer': proposalModule.proposal,
    'contract-generator': contractModule.contract,
    'meeting-minutes-ai': minutesModule.minutes,
    'email-polisher': emailModule.email,
    'cover-letter': coverLetterModule.coverLetter,
    'cover-letter-writer': coverLetterModule.coverLetter,
    'visiting-card-maker': cardModule.card,
  } satisfies Record<string, unknown>;
}

const server: ServerActions | Record<string, never> = databaseConfigured
  ? await loadServerActions()
  : (() => {
      console.warn(
        '[actions] Astro DB is not configured. Server actions have been disabled until ASTRO_DB_REMOTE_URL and ASTRO_DB_APP_TOKEN are set.',
      );
      return {};
    })();

export { server };
