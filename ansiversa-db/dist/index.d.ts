import { Client } from '@libsql/client/web';
import { z } from 'zod';

type QueryParameter = string | number | boolean | null | Uint8Array | Date;
interface QueryResult<T = unknown> {
    rows: T[];
}
interface DbDriver {
    query<T = unknown>(sql: string, params?: QueryParameter[]): Promise<QueryResult<T>>;
    execute<T = unknown>(sql: string, params?: QueryParameter[]): Promise<T>;
}
type DriverFactory<TDriver extends DbDriver, TOptions = unknown> = (options: TOptions) => TDriver;

interface AstroDbDriverOptions {
    url: string;
    authToken?: string;
}
interface AstroDbDriver extends DbDriver {
    readonly client: Client;
}
declare const createAstroDbDriver: (options: AstroDbDriverOptions) => AstroDbDriver;

interface PaginationOptions {
    page?: number;
    pageSize?: number;
}
interface PaginatedResult<TData> {
    data: TData[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

declare const PlatformSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    description: z.ZodString;
    icon: z.ZodString;
    type: z.ZodNullable<z.ZodString>;
    qCount: z.ZodNumber;
    isActive: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: number;
    type: string | null;
    name: string;
    description: string;
    icon: string;
    qCount: number;
    isActive: boolean;
}, {
    id: number;
    type: string | null;
    name: string;
    description: string;
    icon: string;
    qCount: number;
    isActive: boolean;
}>;
declare const NewPlatformSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    icon: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    type: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    qCount: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    icon: string;
    qCount: number;
    isActive: boolean;
    type?: string | null | undefined;
}, {
    name: string;
    type?: string | null | undefined;
    description?: string | undefined;
    icon?: string | undefined;
    qCount?: number | undefined;
    isActive?: boolean | undefined;
}>;
declare const UpdatePlatformSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    qCount: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type?: string | null | undefined;
    name?: string | undefined;
    description?: string | undefined;
    icon?: string | undefined;
    qCount?: number | undefined;
    isActive?: boolean | undefined;
}, {
    type?: string | null | undefined;
    name?: string | undefined;
    description?: string | undefined;
    icon?: string | undefined;
    qCount?: number | undefined;
    isActive?: boolean | undefined;
}>;
declare const SubjectSchema: z.ZodObject<{
    id: z.ZodNumber;
    platformId: z.ZodNumber;
    name: z.ZodString;
    isActive: z.ZodBoolean;
    qCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    qCount: number;
    isActive: boolean;
    platformId: number;
}, {
    id: number;
    name: string;
    qCount: number;
    isActive: boolean;
    platformId: number;
}>;
declare const NewSubjectSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    platformId: z.ZodNumber;
    name: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
    qCount: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    qCount: number;
    isActive: boolean;
    platformId: number;
    id?: number | undefined;
}, {
    name: string;
    platformId: number;
    id?: number | undefined;
    qCount?: number | undefined;
    isActive?: boolean | undefined;
}>;
declare const UpdateSubjectSchema: z.ZodObject<{
    platformId: z.ZodOptional<z.ZodNumber>;
    name: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    qCount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    qCount?: number | undefined;
    isActive?: boolean | undefined;
    platformId?: number | undefined;
}, {
    name?: string | undefined;
    qCount?: number | undefined;
    isActive?: boolean | undefined;
    platformId?: number | undefined;
}>;
declare const TopicSchema: z.ZodObject<{
    id: z.ZodNumber;
    platformId: z.ZodNumber;
    subjectId: z.ZodNumber;
    name: z.ZodString;
    isActive: z.ZodBoolean;
    qCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    qCount: number;
    isActive: boolean;
    platformId: number;
    subjectId: number;
}, {
    id: number;
    name: string;
    qCount: number;
    isActive: boolean;
    platformId: number;
    subjectId: number;
}>;
declare const NewTopicSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    platformId: z.ZodNumber;
    subjectId: z.ZodNumber;
    name: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
    qCount: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    qCount: number;
    isActive: boolean;
    platformId: number;
    subjectId: number;
    id?: number | undefined;
}, {
    name: string;
    platformId: number;
    subjectId: number;
    id?: number | undefined;
    qCount?: number | undefined;
    isActive?: boolean | undefined;
}>;
declare const UpdateTopicSchema: z.ZodObject<{
    platformId: z.ZodOptional<z.ZodNumber>;
    subjectId: z.ZodOptional<z.ZodNumber>;
    name: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    qCount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    qCount?: number | undefined;
    isActive?: boolean | undefined;
    platformId?: number | undefined;
    subjectId?: number | undefined;
}, {
    name?: string | undefined;
    qCount?: number | undefined;
    isActive?: boolean | undefined;
    platformId?: number | undefined;
    subjectId?: number | undefined;
}>;
declare const RoadmapSchema: z.ZodObject<{
    id: z.ZodNumber;
    platformId: z.ZodNumber;
    subjectId: z.ZodNumber;
    topicId: z.ZodNumber;
    name: z.ZodString;
    isActive: z.ZodBoolean;
    qCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    qCount: number;
    isActive: boolean;
    platformId: number;
    subjectId: number;
    topicId: number;
}, {
    id: number;
    name: string;
    qCount: number;
    isActive: boolean;
    platformId: number;
    subjectId: number;
    topicId: number;
}>;
declare const NewRoadmapSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    platformId: z.ZodNumber;
    subjectId: z.ZodNumber;
    topicId: z.ZodNumber;
    name: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
    qCount: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    qCount: number;
    isActive: boolean;
    platformId: number;
    subjectId: number;
    topicId: number;
    id?: number | undefined;
}, {
    name: string;
    platformId: number;
    subjectId: number;
    topicId: number;
    id?: number | undefined;
    qCount?: number | undefined;
    isActive?: boolean | undefined;
}>;
declare const UpdateRoadmapSchema: z.ZodObject<{
    platformId: z.ZodOptional<z.ZodNumber>;
    subjectId: z.ZodOptional<z.ZodNumber>;
    topicId: z.ZodOptional<z.ZodNumber>;
    name: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    qCount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    qCount?: number | undefined;
    isActive?: boolean | undefined;
    platformId?: number | undefined;
    subjectId?: number | undefined;
    topicId?: number | undefined;
}, {
    name?: string | undefined;
    qCount?: number | undefined;
    isActive?: boolean | undefined;
    platformId?: number | undefined;
    subjectId?: number | undefined;
    topicId?: number | undefined;
}>;
declare const QuestionSchema: z.ZodObject<{
    id: z.ZodNumber;
    platformId: z.ZodNumber;
    subjectId: z.ZodNullable<z.ZodNumber>;
    topicId: z.ZodNullable<z.ZodNumber>;
    roadmapId: z.ZodNullable<z.ZodNumber>;
    question: z.ZodString;
    options: z.ZodArray<z.ZodString, "many">;
    answer: z.ZodString;
    explanation: z.ZodNullable<z.ZodString>;
    level: z.ZodEnum<["E", "M", "D"]>;
    isActive: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: number;
    options: string[];
    isActive: boolean;
    platformId: number;
    subjectId: number | null;
    topicId: number | null;
    roadmapId: number | null;
    level: "E" | "M" | "D";
    question: string;
    answer: string;
    explanation: string | null;
}, {
    id: number;
    options: string[];
    isActive: boolean;
    platformId: number;
    subjectId: number | null;
    topicId: number | null;
    roadmapId: number | null;
    level: "E" | "M" | "D";
    question: string;
    answer: string;
    explanation: string | null;
}>;
declare const NewQuestionSchema: z.ZodObject<{
    platformId: z.ZodNumber;
    subjectId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    topicId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    roadmapId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    question: z.ZodString;
    options: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    answer: z.ZodString;
    explanation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    level: z.ZodEnum<["E", "M", "D"]>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    options: string[];
    isActive: boolean;
    platformId: number;
    level: "E" | "M" | "D";
    question: string;
    answer: string;
    subjectId?: number | null | undefined;
    topicId?: number | null | undefined;
    roadmapId?: number | null | undefined;
    explanation?: string | null | undefined;
}, {
    platformId: number;
    level: "E" | "M" | "D";
    question: string;
    answer: string;
    options?: string[] | undefined;
    isActive?: boolean | undefined;
    subjectId?: number | null | undefined;
    topicId?: number | null | undefined;
    roadmapId?: number | null | undefined;
    explanation?: string | null | undefined;
}>;
declare const UpdateQuestionSchema: z.ZodObject<{
    platformId: z.ZodOptional<z.ZodNumber>;
    subjectId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    topicId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    roadmapId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    question: z.ZodOptional<z.ZodString>;
    options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    answer: z.ZodOptional<z.ZodString>;
    explanation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    level: z.ZodOptional<z.ZodEnum<["E", "M", "D"]>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    options?: string[] | undefined;
    isActive?: boolean | undefined;
    platformId?: number | undefined;
    subjectId?: number | null | undefined;
    topicId?: number | null | undefined;
    roadmapId?: number | null | undefined;
    level?: "E" | "M" | "D" | undefined;
    question?: string | undefined;
    answer?: string | undefined;
    explanation?: string | null | undefined;
}, {
    options?: string[] | undefined;
    isActive?: boolean | undefined;
    platformId?: number | undefined;
    subjectId?: number | null | undefined;
    topicId?: number | null | undefined;
    roadmapId?: number | null | undefined;
    level?: "E" | "M" | "D" | undefined;
    question?: string | undefined;
    answer?: string | undefined;
    explanation?: string | null | undefined;
}>;
declare const ResultSchema: z.ZodObject<{
    id: z.ZodNumber;
    userId: z.ZodString;
    platformId: z.ZodNumber;
    subjectId: z.ZodNullable<z.ZodNumber>;
    topicId: z.ZodNullable<z.ZodNumber>;
    roadmapId: z.ZodNullable<z.ZodNumber>;
    level: z.ZodEnum<["E", "M", "D"]>;
    responses: z.ZodUnknown;
    mark: z.ZodNumber;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: number;
    platformId: number;
    subjectId: number | null;
    topicId: number | null;
    roadmapId: number | null;
    userId: string;
    level: "E" | "M" | "D";
    mark: number;
    createdAt: Date;
    responses?: unknown;
}, {
    id: number;
    platformId: number;
    subjectId: number | null;
    topicId: number | null;
    roadmapId: number | null;
    userId: string;
    level: "E" | "M" | "D";
    mark: number;
    createdAt: Date;
    responses?: unknown;
}>;
declare const NewResultSchema: z.ZodObject<{
    userId: z.ZodString;
    platformId: z.ZodNumber;
    subjectId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    topicId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    roadmapId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    level: z.ZodEnum<["E", "M", "D"]>;
    responses: z.ZodOptional<z.ZodUnknown>;
    mark: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    platformId: number;
    userId: string;
    level: "E" | "M" | "D";
    mark: number;
    subjectId?: number | null | undefined;
    topicId?: number | null | undefined;
    roadmapId?: number | null | undefined;
    responses?: unknown;
}, {
    platformId: number;
    userId: string;
    level: "E" | "M" | "D";
    subjectId?: number | null | undefined;
    topicId?: number | null | undefined;
    roadmapId?: number | null | undefined;
    responses?: unknown;
    mark?: number | undefined;
}>;
declare const UpdateResultSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    platformId: z.ZodOptional<z.ZodNumber>;
    subjectId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    topicId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    roadmapId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    level: z.ZodOptional<z.ZodEnum<["E", "M", "D"]>>;
    responses: z.ZodOptional<z.ZodUnknown>;
    mark: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    platformId?: number | undefined;
    subjectId?: number | null | undefined;
    topicId?: number | null | undefined;
    roadmapId?: number | null | undefined;
    userId?: string | undefined;
    level?: "E" | "M" | "D" | undefined;
    responses?: unknown;
    mark?: number | undefined;
}, {
    platformId?: number | undefined;
    subjectId?: number | null | undefined;
    topicId?: number | null | undefined;
    roadmapId?: number | null | undefined;
    userId?: string | undefined;
    level?: "E" | "M" | "D" | undefined;
    responses?: unknown;
    mark?: number | undefined;
}>;
type Platform = z.infer<typeof PlatformSchema>;
type NewPlatform = z.infer<typeof NewPlatformSchema>;
type UpdatePlatform = z.infer<typeof UpdatePlatformSchema>;
type Subject = z.infer<typeof SubjectSchema>;
type NewSubject = z.infer<typeof NewSubjectSchema>;
type UpdateSubject = z.infer<typeof UpdateSubjectSchema>;
type Topic = z.infer<typeof TopicSchema>;
type NewTopic = z.infer<typeof NewTopicSchema>;
type UpdateTopic = z.infer<typeof UpdateTopicSchema>;
type Roadmap = z.infer<typeof RoadmapSchema>;
type NewRoadmap = z.infer<typeof NewRoadmapSchema>;
type UpdateRoadmap = z.infer<typeof UpdateRoadmapSchema>;
type Question = z.infer<typeof QuestionSchema>;
type NewQuestion = z.infer<typeof NewQuestionSchema>;
type UpdateQuestion = z.infer<typeof UpdateQuestionSchema>;
type Result = z.infer<typeof ResultSchema>;
type NewResult = z.infer<typeof NewResultSchema>;
type UpdateResult = z.infer<typeof UpdateResultSchema>;
declare const parsePlatform: (row: unknown) => Platform;
declare const parseSubject: (row: unknown) => Subject;
declare const parseTopic: (row: unknown) => Topic;
declare const parseRoadmap: (row: unknown) => Roadmap;
declare const normalizeQuestion: (row: unknown) => Question;
declare const parseResult: (row: unknown) => Result;

interface PlatformsRepo {
    list(): Promise<Platform[]>;
    listPaginated(options?: PaginationOptions): Promise<PaginatedResult<Platform>>;
    getById(id: number): Promise<Platform | null>;
    create(input: NewPlatform): Promise<Platform>;
    update(id: number, input: UpdatePlatform): Promise<Platform | null>;
    delete(id: number): Promise<Platform | null>;
}
declare const createPlatformsRepo: (driver: DbDriver) => PlatformsRepo;

interface QuestionListOptions extends PaginationOptions {
    platformId?: number;
    subjectId?: number | null;
    topicId?: number | null;
    roadmapId?: number | null;
    level?: Question["level"];
    isActive?: boolean;
}
interface QuestionsRepo {
    listByPlatform(platformId: number): Promise<Question[]>;
    listBySubject(subjectId: number): Promise<Question[]>;
    listByTopic(topicId: number): Promise<Question[]>;
    listByRoadmap(roadmapId: number): Promise<Question[]>;
    listPaginated(options?: QuestionListOptions): Promise<PaginatedResult<Question>>;
    getById(id: number): Promise<Question | null>;
    getRandomByPlatform(platformId: number, limit?: number): Promise<Question[]>;
    create(input: NewQuestion): Promise<Question>;
    update(id: number, input: UpdateQuestion): Promise<Question | null>;
    delete(id: number): Promise<Question | null>;
}
declare const createQuestionsRepo: (driver: DbDriver) => QuestionsRepo;

interface SubjectListOptions extends PaginationOptions {
    platformId?: number;
}
interface SubjectsRepo {
    list(): Promise<Subject[]>;
    listByPlatform(platformId: number): Promise<Subject[]>;
    listPaginated(options?: SubjectListOptions): Promise<PaginatedResult<Subject>>;
    getById(id: number): Promise<Subject | null>;
    create(input: NewSubject): Promise<Subject>;
    update(id: number, input: UpdateSubject): Promise<Subject | null>;
    delete(id: number): Promise<Subject | null>;
}
declare const createSubjectsRepo: (driver: DbDriver) => SubjectsRepo;

interface TopicListOptions extends PaginationOptions {
    platformId?: number;
    subjectId?: number;
}
interface TopicsRepo {
    list(): Promise<Topic[]>;
    listByPlatform(platformId: number): Promise<Topic[]>;
    listBySubject(subjectId: number): Promise<Topic[]>;
    listPaginated(options?: TopicListOptions): Promise<PaginatedResult<Topic>>;
    getById(id: number): Promise<Topic | null>;
    create(input: NewTopic): Promise<Topic>;
    update(id: number, input: UpdateTopic): Promise<Topic | null>;
    delete(id: number): Promise<Topic | null>;
}
declare const createTopicsRepo: (driver: DbDriver) => TopicsRepo;

interface RoadmapListOptions extends PaginationOptions {
    platformId?: number;
    subjectId?: number;
    topicId?: number;
}
interface RoadmapsRepo {
    list(): Promise<Roadmap[]>;
    listByPlatform(platformId: number): Promise<Roadmap[]>;
    listBySubject(subjectId: number): Promise<Roadmap[]>;
    listByTopic(topicId: number): Promise<Roadmap[]>;
    listPaginated(options?: RoadmapListOptions): Promise<PaginatedResult<Roadmap>>;
    getById(id: number): Promise<Roadmap | null>;
    create(input: NewRoadmap): Promise<Roadmap>;
    update(id: number, input: UpdateRoadmap): Promise<Roadmap | null>;
    delete(id: number): Promise<Roadmap | null>;
}
declare const createRoadmapsRepo: (driver: DbDriver) => RoadmapsRepo;

interface ResultListOptions extends PaginationOptions {
    userId?: string;
    platformId?: number;
    subjectId?: number | null;
    topicId?: number | null;
    roadmapId?: number | null;
    level?: Result["level"];
}
interface ResultsRepo {
    list(): Promise<Result[]>;
    listByUser(userId: string): Promise<Result[]>;
    listByPlatform(platformId: number): Promise<Result[]>;
    listPaginated(options?: ResultListOptions): Promise<PaginatedResult<Result>>;
    getById(id: number): Promise<Result | null>;
    create(input: NewResult): Promise<Result>;
    update(id: number, input: UpdateResult): Promise<Result | null>;
    delete(id: number): Promise<Result | null>;
}
declare const createResultsRepo: (driver: DbDriver) => ResultsRepo;

type SortDirection = "asc" | "desc";
type StatusFilter = "all" | "active" | "inactive";
interface PlatformSearchOptions extends PaginationOptions {
    name?: string | null;
    description?: string | null;
    type?: string | null;
    minQuestions?: number | null;
    maxQuestions?: number | null;
    status?: StatusFilter;
    sortColumn?: "id" | "name" | "description" | "type" | "qCount" | "status";
    sortDirection?: SortDirection;
}
interface SubjectSearchOptions extends PaginationOptions {
    name?: string | null;
    platformId?: number | null;
    minQuestions?: number | null;
    maxQuestions?: number | null;
    status?: StatusFilter;
    sortColumn?: "id" | "name" | "platformName" | "platformId" | "qCount" | "status";
    sortDirection?: SortDirection;
}
interface TopicSearchOptions extends PaginationOptions {
    name?: string | null;
    platformId?: number | null;
    subjectId?: number | null;
    minQuestions?: number | null;
    maxQuestions?: number | null;
    status?: StatusFilter;
    sortColumn?: "id" | "name" | "platformName" | "subjectName" | "platformId" | "subjectId" | "qCount" | "status";
    sortDirection?: SortDirection;
}
interface RoadmapSearchOptions extends PaginationOptions {
    name?: string | null;
    platformId?: number | null;
    subjectId?: number | null;
    topicId?: number | null;
    minQuestions?: number | null;
    maxQuestions?: number | null;
    status?: StatusFilter;
    sortColumn?: "id" | "name" | "platformName" | "subjectName" | "topicName" | "platformId" | "subjectId" | "topicId" | "qCount" | "status";
    sortDirection?: SortDirection;
}
interface QuestionSearchOptions extends PaginationOptions {
    questionText?: string | null;
    platformId?: number | null;
    subjectId?: number | null;
    topicId?: number | null;
    roadmapId?: number | null;
    level?: string | null;
    status?: StatusFilter;
    sortColumn?: "id" | "questionText" | "platformName" | "subjectName" | "topicName" | "roadmapName" | "platformId" | "subjectId" | "topicId" | "roadmapId" | "level" | "status";
    sortDirection?: SortDirection;
}
interface QuestionRelations {
    question: Question;
    platformName: string | null;
    subjectName: string | null;
    topicName: string | null;
    roadmapName: string | null;
}
interface SubjectWithPlatform {
    subject: Subject;
    platformName: string | null;
}
interface TopicWithRelations {
    topic: Topic;
    platformName: string | null;
    subjectName: string | null;
}
interface RoadmapWithRelations {
    roadmap: Roadmap;
    platformName: string | null;
    subjectName: string | null;
    topicName: string | null;
}
interface RandomQuestionOptions {
    limit?: number;
    filters?: Omit<QuestionSearchOptions, "page" | "pageSize" | "sortColumn" | "sortDirection">;
    excludeIds?: number[];
}
interface QuizAdminRepo {
    searchPlatforms(options?: PlatformSearchOptions): Promise<PaginatedResult<Platform>>;
    searchSubjects(options?: SubjectSearchOptions): Promise<PaginatedResult<SubjectWithPlatform>>;
    getSubjectDetails(id: number): Promise<SubjectWithPlatform | null>;
    searchTopics(options?: TopicSearchOptions): Promise<PaginatedResult<TopicWithRelations>>;
    getTopicDetails(id: number): Promise<TopicWithRelations | null>;
    searchRoadmaps(options?: RoadmapSearchOptions): Promise<PaginatedResult<RoadmapWithRelations>>;
    getRoadmapDetails(id: number): Promise<RoadmapWithRelations | null>;
    searchQuestions(options?: QuestionSearchOptions): Promise<PaginatedResult<QuestionRelations>>;
    getQuestionDetails(id: number): Promise<QuestionRelations | null>;
    getRandomQuestions(options?: RandomQuestionOptions): Promise<PaginatedResult<QuestionRelations>>;
}
declare const createQuizAdminRepo: (driver: DbDriver) => QuizAdminRepo;

interface PaginatedQueryConfig<TRow, TResult> extends PaginationOptions {
    driver: DbDriver;
    countQuery: string;
    dataQuery: string;
    params?: QueryParameter[];
    mapRow: (row: TRow) => TResult;
}
declare const runPaginatedQuery: <TRow, TResult>(config: PaginatedQueryConfig<TRow, TResult>) => Promise<PaginatedResult<TResult>>;

declare const getNextNumericId: (driver: DbDriver, tableName: string) => Promise<number>;

declare const AstroDbEnvSchema: z.ZodObject<{
    ASTRO_DB_URL: z.ZodString;
    ASTRO_DB_AUTH_TOKEN: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ASTRO_DB_URL: string;
    ASTRO_DB_AUTH_TOKEN?: string | undefined;
}, {
    ASTRO_DB_URL: string;
    ASTRO_DB_AUTH_TOKEN?: string | undefined;
}>;
type AstroDbEnvConfig = z.infer<typeof AstroDbEnvSchema>;
declare const loadAstroDbConfig: (env?: Record<string, string | undefined>) => AstroDbDriverOptions;

export { AstroDbEnvConfig, DbDriver, DriverFactory, NewPlatform, NewPlatformSchema, NewQuestion, NewQuestionSchema, NewResult, NewResultSchema, NewRoadmap, NewRoadmapSchema, NewSubject, NewSubjectSchema, NewTopic, NewTopicSchema, PaginatedResult, PaginationOptions, Platform, PlatformSchema, PlatformSearchOptions, PlatformsRepo, QueryParameter, QueryResult, Question, QuestionListOptions, QuestionRelations, QuestionSchema, QuestionSearchOptions, QuestionsRepo, QuizAdminRepo, RandomQuestionOptions, Result, ResultListOptions, ResultSchema, ResultsRepo, Roadmap, RoadmapListOptions, RoadmapSchema, RoadmapSearchOptions, RoadmapWithRelations, RoadmapsRepo, SortDirection, StatusFilter, Subject, SubjectListOptions, SubjectSchema, SubjectSearchOptions, SubjectWithPlatform, SubjectsRepo, Topic, TopicListOptions, TopicSchema, TopicSearchOptions, TopicWithRelations, TopicsRepo, UpdatePlatform, UpdatePlatformSchema, UpdateQuestion, UpdateQuestionSchema, UpdateResult, UpdateResultSchema, UpdateRoadmap, UpdateRoadmapSchema, UpdateSubject, UpdateSubjectSchema, UpdateTopic, UpdateTopicSchema, createAstroDbDriver, createPlatformsRepo, createQuestionsRepo, createQuizAdminRepo, createResultsRepo, createRoadmapsRepo, createSubjectsRepo, createTopicsRepo, getNextNumericId, loadAstroDbConfig, normalizeQuestion, parsePlatform, parseResult, parseRoadmap, parseSubject, parseTopic, runPaginatedQuery };
