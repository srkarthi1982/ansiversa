import Alpine from 'alpinejs';
import { BaseStore, clone } from '../../../alpineStores/base';
import { getEventPlannerSampleData } from '../../../data/eventPlannerSamples';
import type {
  EventPlannerAutomation,
  EventPlannerEvent,
  EventPlannerIntegration,
  EventPlannerPlanFeature,
  EventPlannerReminder,
  EventPlannerRoadmapStage,
  EventPlannerTask,
} from '../../../types/event-planner';

type TaskFilter = 'all' | 'open' | 'due-soon' | 'completed';

type DashboardMetrics = {
  countdownDays: number;
  openTasks: number;
  dueSoon: number;
  guestResponse: number;
  budgetVariance: number;
  vendorFollowUps: number;
};

const isWithinNextDays = (dateIso: string, days: number): boolean => {
  const timestamp = Date.parse(dateIso);
  if (Number.isNaN(timestamp)) return false;
  const now = Date.now();
  if (timestamp < now) return false;
  const diffDays = (timestamp - now) / (1000 * 60 * 60 * 24);
  return diffDays <= days;
};

const isOverdue = (dateIso: string): boolean => {
  const timestamp = Date.parse(dateIso);
  if (Number.isNaN(timestamp)) return false;
  return timestamp < Date.now();
};

class EventPlannerStore extends BaseStore {
  state: {
    loading: boolean;
    events: EventPlannerEvent[];
    templates: ReturnType<typeof getEventPlannerSampleData>['templates'];
    automations: EventPlannerAutomation[];
    reminders: EventPlannerReminder[];
    integrations: EventPlannerIntegration[];
    planFeatures: EventPlannerPlanFeature[];
    roadmap: EventPlannerRoadmapStage[];
    activeEventId: string | null;
    taskFilter: TaskFilter;
    metrics: DashboardMetrics;
  } = {
    loading: false,
    events: [],
    templates: [],
    automations: [],
    reminders: [],
    integrations: [],
    planFeatures: [],
    roadmap: [],
    activeEventId: null,
    taskFilter: 'open',
    metrics: {
      countdownDays: 0,
      openTasks: 0,
      dueSoon: 0,
      guestResponse: 0,
      budgetVariance: 0,
      vendorFollowUps: 0,
    },
  };

  private initialised = false;

  init(): void {
    if (this.initialised) return;
    this.initialised = true;
    this.hydrate();
  }

  get activeEvent(): EventPlannerEvent | null {
    const { activeEventId } = this.state;
    if (!activeEventId) return null;
    return this.state.events.find((event) => event.id === activeEventId) ?? null;
  }

  get filteredTasks(): EventPlannerTask[] {
    const event = this.activeEvent;
    if (!event) return [];
    const tasks = event.tasks.map((task) => ({ ...task }));
    switch (this.state.taskFilter) {
      case 'open':
        return tasks.filter((task) => task.status !== 'done');
      case 'due-soon':
        return tasks.filter((task) => task.status !== 'done' && isWithinNextDays(task.due, 7));
      case 'completed':
        return tasks.filter((task) => task.status === 'done');
      default:
        return tasks;
    }
  }

  setActiveEvent(id: string): void {
    if (this.state.activeEventId === id) return;
    this.state.activeEventId = id;
    this.refreshMetrics();
  }

  setTaskFilter(filter: TaskFilter): void {
    if (this.state.taskFilter === filter) return;
    this.state.taskFilter = filter;
  }

  private hydrate(): void {
    this.state.loading = true;
    this.setLoaderVisible(true);
    try {
      const sample = getEventPlannerSampleData();
      this.state.events = sample.events.map((event) => clone(event));
      this.state.templates = sample.templates.map((template) => clone(template));
      this.state.automations = sample.automations.map((automation) => clone(automation));
      this.state.reminders = sample.reminders.map((reminder) => clone(reminder));
      this.state.integrations = sample.integrations.map((integration) => clone(integration));
      this.state.planFeatures = sample.planFeatures.map((feature) => clone(feature));
      this.state.roadmap = sample.roadmap.map((stage) => clone(stage));
      this.state.activeEventId = this.state.events[0]?.id ?? null;
      this.refreshMetrics();
    } finally {
      this.state.loading = false;
      this.setLoaderVisible(false);
    }
  }

  private refreshMetrics(): void {
    const event = this.activeEvent;
    if (!event) {
      this.state.metrics = {
        countdownDays: 0,
        openTasks: 0,
        dueSoon: 0,
        guestResponse: 0,
        budgetVariance: 0,
        vendorFollowUps: 0,
      };
      return;
    }

    const openTasks = event.tasks.filter((task) => task.status !== 'done').length;
    const dueSoon = event.tasks.filter((task) => task.status !== 'done' && (isWithinNextDays(task.due, 7) || isOverdue(task.due))).length;

    const guestResponse = event.guests.invited
      ? Math.round((event.guests.responded / event.guests.invited) * 100)
      : 0;

    const budgetVarianceRaw = event.budgets.reduce((acc, line) => acc + (line.actual - line.planned), 0);
    const budgetVariance = Math.round(budgetVarianceRaw);

    const vendorFollowUps = event.vendors.filter((vendor) => vendor.status === 'prospect' || vendor.status === 'shortlisted').length;

    this.state.metrics = {
      countdownDays: event.countdownDays,
      openTasks,
      dueSoon,
      guestResponse,
      budgetVariance,
      vendorFollowUps,
    };
  }
}

const store = new EventPlannerStore();
Alpine.store('eventPlanner', store);

export type EventPlannerStoreType = EventPlannerStore;
