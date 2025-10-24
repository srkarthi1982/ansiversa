import Alpine from "alpinejs";
import { BaseStore, clone } from "../base";
import {
  createPromptProjectSkeleton,
  defaultPromptModel,
  promptBuilderPlans,
  samplePromptBuilderProjects,
  samplePromptBuilderTemplates,
  toPromptSlug,
  type PromptBuilderProject,
  type PromptBuilderTemplate,
  type PromptPlanDetail,
} from "../../data/promptBuilderSamples";

class PromptBuilderStore extends BaseStore {
  private collection: {
    projects: PromptBuilderProject[];
    templates: PromptBuilderTemplate[];
    plans: PromptPlanDetail[];
  } = {
    projects: samplePromptBuilderProjects(),
    templates: samplePromptBuilderTemplates(),
    plans: promptBuilderPlans(),
  };

  get plans() {
    return this.collection.plans;
  }

  get projects() {
    return this.collection.projects;
  }

  get templates() {
    return this.collection.templates;
  }

  listProjects() {
    return clone(this.collection.projects);
  }

  listTemplates() {
    return clone(this.collection.templates);
  }

  getProjectById(id: string) {
    const project = this.collection.projects.find((item) => item.id === id);
    return project ? clone(project) : null;
  }

  getProjectBySlug(slug: string) {
    const project = this.collection.projects.find(
      (item) => item.slug === slug || item.shareSlug === slug,
    );
    return project ? clone(project) : null;
  }

  createBlankProject() {
    const project = createPromptProjectSkeleton();
    this.upsertProject(project);
    return clone(project);
  }

  createFromTemplate(templateKey: string) {
    const template = this.collection.templates.find((item) => item.key === templateKey);
    if (!template) return null;

    const timestamp = Date.now();
    const baseVariables = clone(template.variables);
    const project = createPromptProjectSkeleton({
      id: `proj-${template.key}-${timestamp}`,
      title: template.title,
      slug: `${toPromptSlug(template.title)}-${timestamp.toString(36).slice(-4)}`,
      plan: template.category === "Support" ? "free" : "pro",
      description: template.description,
      tags: template.tags,
      activeVariantId: "A",
      variants: [
        {
          id: "A",
          label: "Variant A",
          description: template.description,
          enabled: true,
          blocks: {
            system: template.blocks.system,
            instruction: template.blocks.instruction,
            toolHints: template.blocks.toolHints,
            examples: [],
          },
        },
        {
          id: "B",
          label: "Variant B",
          description: "Secondary experiment",
          enabled: false,
          blocks: {
            system: template.blocks.system,
            instruction: template.blocks.instruction,
            toolHints: template.blocks.toolHints,
            examples: [],
          },
        },
      ],
      variables: baseVariables,
      testCases: [
        {
          id: `case-${template.key}-1`,
          label: "Sample scenario",
          persona: "Primary persona",
          input: Object.fromEntries(
            baseVariables.map((variable) => [variable.name, variable.defaultValue ?? ""]),
          ),
          expectedTraits: ["Clear"],
          tags: [template.category.toLowerCase()],
          enabled: true,
          lastRunAt: null,
        },
      ],
      model: defaultPromptModel(),
      runs: [],
      lintIssues: [],
      versions: [],
    });

    this.upsertProject(project);
    return clone(project);
  }

  upsertProject(project: PromptBuilderProject) {
    const payload = clone(project);
    const index = this.collection.projects.findIndex((item) => item.id === project.id);
    if (index >= 0) {
      this.collection.projects.splice(index, 1, payload);
    } else {
      this.collection.projects.unshift(payload);
    }
  }
}

const store = new PromptBuilderStore();
Alpine.store("promptBuilder", store);
Alpine.store("prompt-builder", store);

export type PromptBuilderStoreType = PromptBuilderStore;
