import {
  createAstroDbDriver,
  loadAstroDbConfig,
  createPlatformsRepo,
  createSubjectsRepo,
  createTopicsRepo,
  createRoadmapsRepo,
  createQuestionsRepo,
  createResultsRepo,
  createQuizAdminRepo,
} from '@ansiversa/db';

const driver = createAstroDbDriver(
  loadAstroDbConfig(import.meta.env as Record<string, string | undefined>),
);

export const platformRepository = createPlatformsRepo(driver);
export const subjectRepository = createSubjectsRepo(driver);
export const topicRepository = createTopicsRepo(driver);
export const roadmapRepository = createRoadmapsRepo(driver);
export const questionRepository = createQuestionsRepo(driver);
export const resultRepository = createResultsRepo(driver);
export const quizAdminRepository = createQuizAdminRepo(driver);
