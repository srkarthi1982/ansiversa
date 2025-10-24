import Alpine from 'alpinejs';
import {
  buildAssessmentSummary,
  createDraftPlan,
  findPlanBySlug,
  getApplications,
  getDashboard,
  getResourceMap,
  getRoleLibrary,
  getSamplePlanDetail,
} from '../../lib/career/mock';
import type {
  CareerApplication,
  CareerDashboardSnapshot,
  CareerLearningPlan,
  CareerPlanBuilderState,
  CareerPlanSummary,
  CareerProject,
  CareerRole,
  CareerSprintPlan,
  CareerTrackerState,
} from '../../types/career';

const loaderStore = () => Alpine.store('loader') as { show?: () => void; hide?: () => void } | undefined;

const clone = <T>(value: T): T => structuredClone(value);

const formatRelativeDate = (value: string | null) => {
  if (!value) return 'Not saved yet';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) {
    const diffMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};

type CareerApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};

type BuilderInitOptions = {
  id?: string | null;
};

class CareerStore {
  dashboard: {
    initialized: boolean;
    loading: boolean;
    data: CareerDashboardSnapshot | null;
    highlightedPlanId: string | null;
  } = {
    initialized: false,
    loading: false,
    data: null,
    highlightedPlanId: null,
  };

  builder: CareerPlanBuilderState = this.createInitialBuilderState();

  builderSteps: Array<{ id: string; label: string; icon: string }> = [
    { id: 'profile', label: 'Profile', icon: 'fas fa-user' },
    { id: 'targets', label: 'Targets', icon: 'fas fa-bullseye' },
    { id: 'gaps', label: 'Gaps', icon: 'fas fa-chart-simple' },
    { id: 'learning', label: 'Learning', icon: 'fas fa-book-open' },
    { id: 'projects', label: 'Projects', icon: 'fas fa-diagram-project' },
    { id: 'sprint', label: 'Sprint', icon: 'fas fa-calendar-week' },
    { id: 'tracker', label: 'Tracker', icon: 'fas fa-table-list' },
    { id: 'review', label: 'Review', icon: 'fas fa-clipboard-check' },
  ];

  tracker: CareerTrackerState = {
    planId: '',
    applications: [],
    filters: {
      status: 'all',
      search: '',
    },
  };

  roles: {
    initialized: boolean;
    items: CareerRole[];
    filtered: CareerRole[];
    filters: { query: string; category: 'all' | string; demand: 'all' | 'low' | 'med' | 'high' };
  } = {
    initialized: false,
    items: [],
    filtered: [],
    filters: { query: '', category: 'all', demand: 'all' },
  };

  resources = getResourceMap();

  viewPlan: CareerPlanBuilderState | null = null;

  onInit(location: Location) {
    if (location.pathname.startsWith('/career/builder')) {
      const params = new URLSearchParams(location.search);
      this.initBuilder({ id: params.get('id') });
    } else if (location.pathname.startsWith('/career/tracker')) {
      this.initTracker();
    } else if (location.pathname.startsWith('/career/roles')) {
      this.initRoles();
    } else if (location.pathname.startsWith('/career/view/')) {
      const slug = location.pathname.split('/').filter(Boolean).pop() ?? '';
      this.initPublicView(slug);
    } else if (location.pathname.startsWith('/career')) {
      this.initDashboard();
    }
  }

  createInitialBuilderState(): CareerPlanBuilderState {
    const seed = createDraftPlan('Untitled career plan').plan;
    return clone(seed);
  }

  initDashboard(): void {
    if (this.dashboard.initialized) return;
    this.dashboard.initialized = true;
    this.dashboard.loading = true;
    try {
      this.dashboard.data = getDashboard();
      this.dashboard.highlightedPlanId = this.dashboard.data.plans[0]?.id ?? null;
    } finally {
      this.dashboard.loading = false;
    }
  }

  async createPlan(title?: string): Promise<void> {
    if (this.dashboard.loading) return;
    const loader = loaderStore();
    loader?.show?.();
    try {
      const body = title ? { title } : {};
      const response = await this.callCareerApi<{ plan: CareerPlanSummary; redirectTo: string }>('/career/api/create', body);
      if (!response) return;
      const snapshot = this.dashboard.data ?? (getDashboard() as CareerDashboardSnapshot);
      snapshot.plans = [response.plan, ...snapshot.plans];
      this.dashboard.data = snapshot;
      window.location.href = response.redirectTo;
    } catch (error) {
      console.error('Unable to create career plan', error);
    } finally {
      loader?.hide?.();
    }
  }

  async duplicatePlan(planId: string): Promise<void> {
    const loader = loaderStore();
    loader?.show?.();
    try {
      const data = await this.callCareerApi<{ plan: CareerPlanSummary }>(
        '/career/api/duplicate',
        { id: planId },
      );
      if (!data) return;
      if (!this.dashboard.data) {
        this.dashboard.data = getDashboard();
      }
      this.dashboard.data!.plans.unshift(data.plan);
    } catch (error) {
      console.error('Unable to duplicate plan', error);
    } finally {
      loader?.hide?.();
    }
  }

  async deletePlan(planId: string): Promise<void> {
    if (!confirm('Delete this plan? You can always recreate it later.')) return;
    try {
      await this.callCareerApi<{ ok: boolean }>('/career/api/delete', { id: planId });
      if (this.dashboard.data) {
        this.dashboard.data.plans = this.dashboard.data.plans.filter((plan) => plan.id !== planId);
      }
    } catch (error) {
      console.error('Unable to delete plan', error);
    }
  }

  initBuilder(options?: BuilderInitOptions): void {
    const detail = getSamplePlanDetail();
    const builderState = this.hydrateBuilder(detail);
    this.builder = builderState;
    if (options?.id) {
      this.builder.id = options.id;
    }
  }

  updateIndustries(input: string): void {
    this.builder.profile.industries = input
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  updateInterests(input: string): void {
    this.builder.profile.interests = input
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  addTargetRole(roleId: string, priorityInput: string | number, level: string): void {
    const trimmed = roleId.trim();
    if (!trimmed) return;
    const priority = Number(priorityInput) || this.builder.targets.length + 1;
    const normalizedLevel = (level || 'mid') as 'junior' | 'mid' | 'senior';
    this.builder.targets.push({ roleId: trimmed, priority, level: normalizedLevel });
  }

  removeTargetRole(index: number): void {
    this.builder.targets.splice(index, 1);
  }

  private hydrateBuilder(detail: ReturnType<typeof getSamplePlanDetail>): CareerPlanBuilderState {
    return {
      id: detail.id,
      title: detail.title,
      slug: detail.slug,
      status: detail.status,
      profile: clone(detail.profile),
      targets: clone(detail.targets),
      skillsCurrent: clone(detail.skillsCurrent),
      skillsRequired: clone(detail.skillsRequired),
      gapMatrix: clone(detail.gapMatrix),
      learningPlan: clone(detail.learningPlan),
      sprintPlan: clone(detail.sprintPlan),
      projects: clone(detail.projects),
      resumeBullets: clone(detail.resumeBullets),
      notes: detail.notes ?? '',
      autosave: { status: 'idle', label: null },
      assessment: null,
      activeStep: 'profile',
      lastSavedAt: detail.lastSavedAt,
      createdAt: detail.createdAt,
    };
  }

  setBuilderStep(stepId: string): void {
    this.builder.activeStep = stepId;
  }

  async saveBuilderDraft(): Promise<void> {
    try {
      this.builder.autosave.status = 'saving';
      const result = await this.callCareerApi<{ lastSavedAt: string }>('/career/api/save', {
        id: this.builder.id,
        payload: {
          title: this.builder.title,
          profile: this.builder.profile,
          targets: this.builder.targets,
          skillsCurrent: this.builder.skillsCurrent,
          skillsRequired: this.builder.skillsRequired,
          gapMatrix: this.builder.gapMatrix,
          learningPlan: this.builder.learningPlan,
          sprintPlan: this.builder.sprintPlan,
          projects: this.builder.projects,
          resumeBullets: this.builder.resumeBullets,
          notes: this.builder.notes,
        },
      });
      if (result?.lastSavedAt) {
        this.builder.autosave = { status: 'saved', label: formatRelativeDate(result.lastSavedAt) };
        this.builder.lastSavedAt = result.lastSavedAt;
        setTimeout(() => {
          this.builder.autosave.status = 'idle';
        }, 2000);
      }
    } catch (error) {
      console.error('Unable to save plan', error);
      this.builder.autosave.status = 'error';
    }
  }

  generateAssessment(): void {
    const assessment = buildAssessmentSummary(this.builder.profile);
    this.builder.assessment = assessment;
  }

  async generateLearningPlan(): Promise<void> {
    try {
      const plan = await this.callCareerApi<{ learningPlan: CareerLearningPlan; etaWeeks: number }>(
        '/career/api/plan/learning',
        {
          skillsCurrent: this.builder.skillsCurrent,
          skillsRequired: this.builder.skillsRequired,
          hoursPerWeek: this.builder.profile.constraints.hoursPerWeek,
        },
      );
      if (plan?.learningPlan) {
        this.builder.learningPlan = plan.learningPlan;
        this.builder.learningPlan.etaWeeks = plan.etaWeeks;
      }
    } catch (error) {
      console.error('Unable to generate learning plan', error);
    }
  }

  async generateSprintPlan(): Promise<void> {
    try {
      const result = await this.callCareerApi<{ sprintPlan: CareerSprintPlan }>(
        '/career/api/plan/sprint',
        { learningPlan: this.builder.learningPlan, jobsPerWeek: 8, networkingPerWeek: 2 },
      );
      if (result?.sprintPlan) {
        this.builder.sprintPlan = result.sprintPlan;
      }
    } catch (error) {
      console.error('Unable to generate sprint plan', error);
    }
  }

  async generateProjects(): Promise<void> {
    try {
      const result = await this.callCareerApi<{ projects: CareerProject[] }>(
        '/career/api/projects',
        { targetRole: this.builder.targets[0]?.roleId ?? 'frontend_engineer', level: this.builder.targets[0]?.level ?? 'mid' },
      );
      if (result?.projects) {
        this.builder.projects = result.projects;
      }
    } catch (error) {
      console.error('Unable to generate projects', error);
    }
  }

  async generateResumeBullets(): Promise<void> {
    try {
      const result = await this.callCareerApi<{ bullets: string[] }>(
        '/career/api/resume-bullets',
        {
          profile: this.builder.profile,
          projects: this.builder.projects,
          targetRole: this.builder.targets[0]?.roleId ?? 'frontend_engineer',
        },
      );
      if (Array.isArray(result?.bullets)) {
        this.builder.resumeBullets = result.bullets;
      }
    } catch (error) {
      console.error('Unable to generate resume bullets', error);
    }
  }

  async publishPlan(): Promise<void> {
    try {
      const data = await this.callCareerApi<{ url: string }>('/career/api/publish', { id: this.builder.id });
      if (data?.url) {
        alert(`Plan published! Preview at ${data.url}`);
      }
    } catch (error) {
      console.error('Unable to publish plan', error);
    }
  }

  async exportPlan(format: 'pdf' | 'docx' | 'md' | 'csv'): Promise<void> {
    try {
      const data = await this.callCareerApi<{ url: string }>('/career/api/export', { id: this.builder.id, format });
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Unable to export plan', error);
    }
  }

  initTracker(): void {
    const applications = getApplications();
    this.tracker.planId = applications[0]?.planId ?? '';
    this.tracker.applications = applications;
  }

  get filteredApplications(): CareerApplication[] {
    const { status, search } = this.tracker.filters;
    return this.tracker.applications.filter((app) => {
      const matchesStatus = status === 'all' || app.status === status;
      const matchesSearch =
        !search ||
        app.company.toLowerCase().includes(search.toLowerCase()) ||
        app.role.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  async upsertApplication(application: CareerApplication): Promise<void> {
    try {
      const result = await this.callCareerApi<{ item: CareerApplication }>(
        '/career/api/applications',
        { op: 'update', item: application },
      );
      if (!result?.item) return;
      const index = this.tracker.applications.findIndex((app) => app.id === result.item.id);
      if (index === -1) {
        this.tracker.applications.unshift(result.item);
      } else {
        this.tracker.applications.splice(index, 1, result.item);
      }
    } catch (error) {
      console.error('Unable to update application', error);
    }
  }

  async removeApplication(applicationId: string): Promise<void> {
    try {
      await this.callCareerApi<{ ok: boolean }>(
        '/career/api/applications',
        { op: 'delete', item: { id: applicationId } },
      );
      this.tracker.applications = this.tracker.applications.filter((app) => app.id !== applicationId);
    } catch (error) {
      console.error('Unable to delete application', error);
    }
  }

  initRoles(): void {
    if (this.roles.initialized) return;
    this.roles.items = getRoleLibrary();
    this.roles.initialized = true;
    this.applyRoleFilters();
  }

  applyRoleFilters(): void {
    const { query, category, demand } = this.roles.filters;
    const q = query.toLowerCase();
    this.roles.filtered = this.roles.items.filter((role) => {
      const matchesQuery =
        !q ||
        role.title.toLowerCase().includes(q) ||
        role.summary.toLowerCase().includes(q) ||
        role.skills.some((skill) => skill.toLowerCase().includes(q));
      const matchesCategory = category === 'all' || role.category === category;
      const matchesDemand = demand === 'all' || role.demandLevel === demand;
      return matchesQuery && matchesCategory && matchesDemand;
    });
  }

  initPublicView(slug: string): void {
    const detail = findPlanBySlug(slug) ?? getSamplePlanDetail();
    this.viewPlan = this.hydrateBuilder(detail);
  }

  formatRelative(value: string | null): string {
    return formatRelativeDate(value);
  }

  get builderAutosaveLabel(): string {
    if (this.builder.autosave.status === 'saving') {
      return 'Saving…';
    }
    if (this.builder.autosave.status === 'saved') {
      return `Saved ${this.builder.autosave.label ?? 'just now'}`;
    }
    return 'Autosave ready';
  }

  private async callCareerApi<T>(url: string, payload?: Record<string, unknown>): Promise<T | null> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload ? JSON.stringify(payload) : JSON.stringify({}),
    });
    const json = (await response.json()) as CareerApiResponse<T>;
    if (!json.success) {
      throw new Error(json.error?.message ?? 'Career API request failed');
    }
    return json.data ?? null;
  }
}

const careerStore = new CareerStore();

Alpine.store('career', careerStore);

export type CareerStoreType = CareerStore;
