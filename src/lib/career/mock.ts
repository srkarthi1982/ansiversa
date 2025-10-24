import {
  careerApplications,
  careerDashboardSnapshot,
  careerPlanDetail,
  careerResources,
  careerRoles,
} from '../../data/career';
import type {
  CareerApplication,
  CareerAssessment,
  CareerDashboardSnapshot,
  CareerLearningPlan,
  CareerPlanBuilderState,
  CareerPlanDetail,
  CareerPlanProfile,
  CareerPlanSummary,
  CareerProject,
  CareerRole,
  CareerSprintPlan,
} from '../../types/career';

const clone = <T>(value: T): T => structuredClone(value);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const createEmptyPlanState = (title = 'Untitled career plan'): CareerPlanBuilderState => {
  const id = crypto.randomUUID();
  const slug = slugify(title) || `career-plan-${id.slice(0, 6)}`;
  const now = new Date().toISOString();
  return {
    id,
    title,
    slug,
    status: 'draft',
    profile: {
      currentRole: '',
      experienceYears: 0,
      industries: [],
      education: '',
      interests: [],
      constraints: {
        remote: true,
        hoursPerWeek: 6,
      },
      summary: '',
    },
    targets: [],
    skillsCurrent: {},
    skillsRequired: {},
    gapMatrix: [],
    learningPlan: { modules: [], totalHours: 0, etaWeeks: 0 },
    sprintPlan: { weeks: [] },
    projects: [],
    resumeBullets: [],
    notes: '',
    autosave: { status: 'idle', label: null },
    assessment: null,
    activeStep: 'profile',
    lastSavedAt: now,
    createdAt: now,
  };
};

export const getDashboard = (): CareerDashboardSnapshot => clone(careerDashboardSnapshot);

export const getPlanSummaryList = (): CareerPlanSummary[] => clone(careerDashboardSnapshot.plans);

export const getRoleLibrary = (): CareerRole[] => clone(careerRoles);

export const getResourceMap = () => clone(careerResources);

export const getSamplePlanDetail = (): CareerPlanDetail => clone(careerPlanDetail);

export const findPlanBySlug = (slug: string): CareerPlanDetail | null => {
  const sample = getSamplePlanDetail();
  if (sample.slug === slug) {
    return sample;
  }
  if (slug === 'product-operations-uplevel') {
    const plan = clone(sample);
    plan.id = 'plan-product-ops';
    plan.slug = slug;
    plan.title = 'Product Operations Uplevel';
    plan.status = 'published';
    plan.profile.currentRole = 'Implementation Specialist';
    plan.profile.interests = ['operations', 'product discovery'];
    plan.targets = [{ roleId: 'product_manager', priority: 1, label: 'Primary role', level: 'mid' }];
    plan.learningPlan.etaWeeks = 10;
    plan.projects = plan.projects.slice(0, 2);
    plan.resumeBullets = [
      'Built internal tooling to automate onboarding and reduce manual effort by 45%.',
      'Partnered with PM to define success metrics for rollout launches.',
    ];
    return plan;
  }
  return null;
};

export const getApplications = (): CareerApplication[] => clone(careerApplications);

export const createDraftPlan = (title?: string) => {
  const state = createEmptyPlanState(title ?? 'Untitled career plan');
  return {
    plan: state,
    redirectTo: `/career/builder?id=${state.id}`,
  };
};

export const duplicatePlan = (planId: string) => {
  const source = planId === careerPlanDetail.id ? getSamplePlanDetail() : createEmptyPlanState();
  const copy = clone(source);
  copy.id = crypto.randomUUID();
  copy.slug = `${copy.slug}-copy`;
  copy.title = `${copy.title} (Copy)`;
  copy.status = 'draft';
  copy.lastSavedAt = new Date().toISOString();
  return copy;
};

export const buildAssessmentSummary = (profile: CareerPlanProfile): CareerAssessment => {
  const segments: string[] = [];
  if (profile.currentRole) {
    segments.push(`Transitioning from ${profile.currentRole}`);
  }
  if (profile.interests.length > 0) {
    segments.push(`interested in ${profile.interests.slice(0, 3).join(', ')}`);
  }
  if (profile.constraints.hoursPerWeek) {
    segments.push(`available ${profile.constraints.hoursPerWeek} hrs/week`);
  }
  const summary =
    segments.length > 0
      ? `${segments.join(' · ')}. Focus on framing customer impact and pairing with mentors.`
      : 'Add details to unlock a personalised assessment.';

  const suggestions = careerRoles.slice(0, 3).map((role) => ({
    roleId: role.id,
    reason: `Strong overlap with ${role.skills.slice(0, 3).join(', ')}.`,
  }));

  return { summary, suggestedRoles: suggestions };
};

export const generateLearningPlan = (
  skillsCurrent: Record<string, number>,
  skillsRequired: Record<string, number>,
): CareerLearningPlan => {
  const modules = clone(careerPlanDetail.learningPlan.modules);
  const totalHours = modules.reduce((sum, module) => sum + module.hours, 0);
  const maxGap = Object.entries(skillsRequired).reduce((max, [skill, target]) => {
    const current = skillsCurrent[skill] ?? 0;
    const gap = Math.max(target - current, 0);
    return Math.max(max, gap);
  }, 0);
  const etaWeeks = Math.max(8, maxGap * 4);
  return { modules, totalHours, etaWeeks };
};

export const generateSprintPlan = (): CareerSprintPlan => clone(careerPlanDetail.sprintPlan);

export const generateProjects = (): CareerProject[] => clone(careerPlanDetail.projects);

export const generateResumeBullets = (): string[] => clone(careerPlanDetail.resumeBullets);
