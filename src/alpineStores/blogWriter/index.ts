import Alpine from 'alpinejs';
import {
  blogTemplates,
  createEmptyBlogPost,
  sampleBlogPosts,
  sampleIdeas,
  sampleImagePrompts,
  type BlogAiIdea,
  type BlogAiPrompt,
  type BlogPostRecord,
  type BlogTemplate,
  type BlogTemplateKey,
} from '../../lib/blog-writer/schema';
import {
  computePostStats,
  describeTemplateDifficulty,
  estimateReadingMinutes,
  formatDate as formatDateLabel,
  formatRelativeTime,
  newId,
  outlineToHeadings,
  slugify,
  summarizeContent,
  wordCountFromMarkdown,
} from '../../lib/blog-writer/utils';
import { readJSON, writeJSON } from '../../utils/storage';

const STORAGE_KEYS = {
  posts: 'ansiversa.blog-writer.posts.v1',
  plan: 'ansiversa.blog-writer.plan.v1',
  lastId: 'ansiversa.blog-writer.last-id.v1',
};

type ToastState = { message: string; type: 'success' | 'error' | 'info' } | null;

type ActivityItem = {
  id: string;
  icon: string;
  color: string;
  label: string;
  timestamp: string;
};

type Plan = 'free' | 'pro';

type BuilderExportFormat = 'md' | 'html' | 'pdf';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const loaderStore = () => Alpine.store('loader') as { show?: () => void; hide?: () => void } | undefined;

const filterIdeasByTopic = (topic: string): BlogAiIdea[] => {
  if (!topic) return sampleIdeas.map((idea) => ({ ...idea }));
  const normalized = topic.trim().toLowerCase();
  const matches = sampleIdeas.filter(
    (idea) =>
      idea.topic.toLowerCase().includes(normalized) ||
      idea.headline.toLowerCase().includes(normalized) ||
      idea.summary.toLowerCase().includes(normalized),
  );
  if (matches.length === 0) {
    return sampleIdeas.slice(0, 3).map((idea) => ({
      ...idea,
      id: newId(),
      headline: `${idea.headline} (${topic})`,
    }));
  }
  return matches.map((idea) => ({ ...idea, id: newId() }));
};

type OutlineInsertionPosition = 'after' | 'before' | 'child';

type SeoInsight = { id: string; label: string; suggestion: string; positive: boolean };

type BuilderTab = 'draft' | 'outline' | 'seo' | 'media';

type BuilderAIUsage = {
  ideas: number;
  outline: number;
  expand: number;
  rewrite: number;
  seo: number;
  image: number;
};

const defaultAiUsage = (): BuilderAIUsage => ({ ideas: 0, outline: 0, expand: 0, rewrite: 0, seo: 0, image: 0 });

class BlogWriterStore {
  state = {
    loading: false,
    plan: (readJSON<Plan>(STORAGE_KEYS.plan, 'free') as Plan) ?? 'free',
    posts: [] as BlogPostRecord[],
    filtered: [] as BlogPostRecord[],
    filters: {
      status: 'all' as 'all' | BlogPostRecord['status'],
      template: 'all' as 'all' | BlogTemplateKey,
      search: '',
    },
    metrics: {
      drafts: 0,
      published: 0,
      totalWords: 0,
      avgRead: 0,
    },
    activity: [] as ActivityItem[],
    aiUsage: defaultAiUsage(),
  };

  builder = {
    id: null as string | null,
    loading: false,
    record: createEmptyBlogPost(),
    tab: 'draft' as BuilderTab,
    hasUnsavedChanges: false,
    autosaveLabel: null as string | null,
    lastSavedLabel: null as string | null,
    toast: null as ToastState,
    ideaTopic: '',
    ideaLoading: false,
    ideas: [] as BlogAiIdea[],
    selectedIdeaId: null as string | null,
    outlineGenerating: false,
    selectedOutlineId: null as string | null,
    aiUsage: defaultAiUsage(),
    seoInsights: [] as SeoInsight[],
    imagePrompts: [] as BlogAiPrompt[],
    imageLoading: false,
    exportBusy: false,
    shareUrl: null as string | null,
    stats: { wordCount: 0, readingMinutes: 0 },
    keywordDraft: '',
    newTag: '',
  };

  admin = {
    metrics: {
      total: 0,
      published: 0,
      drafts: 0,
      avgSeo: 0,
      aiCalls: 0,
    },
    topTags: [] as { tag: string; count: number }[],
    latestActivity: [] as ActivityItem[],
    planBreakdown: [
      { label: 'Free seats', value: 1, icon: 'fa-seedling', color: 'text-emerald-600' },
      { label: 'Pro seats', value: 0, icon: 'fa-rocket', color: 'text-indigo-600' },
    ],
  };

  templates: BlogTemplate[] = blogTemplates;

  private listInitialized = false;
  private autosaveTimer: ReturnType<typeof setTimeout> | null = null;
  onInit(location?: Location) {
    const pathname = location?.pathname ?? window.location.pathname;
    if (pathname.startsWith('/blog-writer/editor')) {
      const params = new URLSearchParams(location?.search ?? window.location.search);
      const id = params.get('id');
      this.initEditor({ id });
      return;
    }
    if (pathname.startsWith('/blog-writer/admin')) {
      this.initDashboard();
      this.refreshAdmin();
      return;
    }
    this.initDashboard();
  }

  initDashboard() {
    this.ensureList();
  }

  initEditor(options: { id?: string | null } = {}) {
    this.ensureList();
    void this.loadBuilder(options.id ?? null);
  }

  private ensureList() {
    if (this.listInitialized) return;
    this.listInitialized = true;
    void this.loadPosts();
  }
  async loadPosts() {
    this.state.loading = true;
    loaderStore()?.show?.();
    try {
      const stored = readJSON<BlogPostRecord[] | null>(STORAGE_KEYS.posts, null);
      if (stored && Array.isArray(stored) && stored.length > 0) {
        this.state.posts = stored;
      } else {
        this.state.posts = clone(sampleBlogPosts);
      }
      this.applyFilters();
      this.updateMetrics();
      this.refreshActivity();
      this.refreshAdmin();
    } catch (error) {
      console.error('Failed to load blog writer records', error);
      this.state.posts = clone(sampleBlogPosts);
      this.applyFilters();
      this.updateMetrics();
      this.refreshActivity();
      this.refreshAdmin();
    } finally {
      this.state.loading = false;
      loaderStore()?.hide?.();
    }
  }

  private persist() {
    writeJSON(STORAGE_KEYS.posts, this.state.posts);
    writeJSON(STORAGE_KEYS.plan, this.state.plan);
  }

  applyFilters() {
    const { status, template, search } = this.state.filters;
    const normalized = search.trim().toLowerCase();
    this.state.filtered = this.state.posts.filter((post) => {
      if (status !== 'all' && post.status !== status) return false;
      if (template !== 'all' && post.templateKey !== template) return false;
      if (!normalized) return true;
      const haystack = `${post.title} ${post.summary} ${post.seo.slug} ${post.tags.join(' ')}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }

  setFilter(key: 'status' | 'template' | 'search', value: string) {
    // @ts-expect-error dynamic assignment
    this.state.filters[key] = value;
    this.applyFilters();
  }
  updateMetrics() {
    const drafts = this.state.posts.filter((post) => post.status === 'draft');
    const published = this.state.posts.filter((post) => post.status === 'published');
    const totalWords = this.state.posts.reduce(
      (acc, post) => acc + (post.wordCount || wordCountFromMarkdown(post.contentMd)),
      0,
    );
    const avgRead = this.state.posts.length
      ? Math.round(
          this.state.posts.reduce(
            (acc, post) => acc + (post.readingMinutes || estimateReadingMinutes(post.wordCount)),
            0,
          ) / this.state.posts.length,
        )
      : 0;
    this.state.metrics = {
      drafts: drafts.length,
      published: published.length,
      totalWords,
      avgRead,
    };
  }

  refreshActivity() {
    const events: ActivityItem[] = [];
    this.state.posts.forEach((post) => {
      if (post.lastSavedAt) {
        events.push({
          id: `${post.id}-save`,
          icon: 'fa-floppy-disk',
          color: 'text-indigo-600',
          label: `Updated “${post.title}”`,
          timestamp: post.lastSavedAt,
        });
      }
      if (post.publishedAt) {
        events.push({
          id: `${post.id}-publish`,
          icon: 'fa-earth-americas',
          color: 'text-emerald-600',
          label: `Published “${post.title}”`,
          timestamp: post.publishedAt,
        });
      }
    });
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    this.state.activity = events.slice(0, 10);
  }

  refreshAdmin() {
    const total = this.state.posts.length;
    const published = this.state.posts.filter((post) => post.status === 'published');
    const drafts = this.state.posts.filter((post) => post.status === 'draft');
    const avgSeo = total
      ? Math.round(this.state.posts.reduce((acc, post) => acc + (post.seo?.score ?? 0), 0) / total)
      : 0;
    const aiCalls = Object.values(this.state.aiUsage).reduce((acc, value) => acc + value, 0);
    const tagsMap = new Map<string, number>();
    this.state.posts.forEach((post) => {
      post.tags.forEach((tag) => {
        const key = tag.toLowerCase();
        tagsMap.set(key, (tagsMap.get(key) ?? 0) + 1);
      });
    });
    const topTags = Array.from(tagsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag, count]) => ({ tag, count }));
    this.admin.metrics = {
      total,
      published: published.length,
      drafts: drafts.length,
      avgSeo,
      aiCalls,
    };
    this.admin.topTags = topTags;
    this.admin.latestActivity = this.state.activity.slice(0, 6);
    this.admin.planBreakdown = [
      { label: 'Free seats', value: this.state.plan === 'free' ? 1 : 0, icon: 'fa-seedling', color: 'text-emerald-600' },
      { label: 'Pro seats', value: this.state.plan === 'pro' ? 1 : 0, icon: 'fa-rocket', color: 'text-indigo-600' },
    ];
  }
  createDraft(templateKey?: BlogTemplateKey) {
    const record = createEmptyBlogPost(templateKey);
    this.state.posts.unshift(record);
    this.applyFilters();
    this.updateMetrics();
    this.refreshActivity();
    this.persist();
    if (typeof window !== 'undefined') {
      window.location.assign(`/blog-writer/editor?id=${record.id}`);
    }
  }

  duplicateDraft(id: string) {
    const original = this.state.posts.find((post) => post.id === id);
    if (!original) return;
    const copy = clone(original);
    copy.id = newId();
    copy.status = 'draft';
    copy.title = `${copy.title} (Copy)`;
    copy.seo.slug = slugify(copy.title || 'draft-post');
    copy.lastSavedAt = new Date().toISOString();
    copy.publishedAt = null;
    copy.createdAt = new Date().toISOString();
    copy.versions = [];
    copy.media = [...(copy.media ?? [])].map((item) => ({ ...item, id: newId(), createdAt: new Date().toISOString() }));
    this.state.posts.unshift(copy);
    this.applyFilters();
    this.updateMetrics();
    this.refreshActivity();
    this.persist();
  }

  deleteDraft(id: string) {
    this.state.posts = this.state.posts.filter((post) => post.id !== id);
    this.applyFilters();
    this.updateMetrics();
    this.refreshActivity();
    this.persist();
  }

  openEditor(id: string) {
    if (typeof window !== 'undefined') {
      window.location.assign(`/blog-writer/editor?id=${id}`);
    }
  }

  async loadBuilder(id: string | null) {
    this.builder.loading = true;
    loaderStore()?.show?.();
    try {
      let record: BlogPostRecord | null = null;
      if (id) {
        record = this.state.posts.find((post) => post.id === id) ?? null;
      }
      if (!record) {
        record = createEmptyBlogPost();
        this.state.posts.unshift(record);
        this.applyFilters();
        this.updateMetrics();
        this.refreshActivity();
      }
      this.builder.id = record.id;
      this.builder.record = clone(record);
      const stats = computePostStats(this.builder.record);
      this.builder.stats = stats;
      this.builder.hasUnsavedChanges = false;
      this.builder.autosaveLabel = null;
      this.builder.lastSavedLabel = record.lastSavedAt ? formatRelativeTime(record.lastSavedAt) : null;
      this.builder.ideaTopic = record.ideaTopic ?? '';
      this.builder.ideas = record.ideaTopic ? filterIdeasByTopic(record.ideaTopic) : sampleIdeas.map((idea) => ({ ...idea }));
      this.builder.selectedIdeaId = null;
      this.builder.outlineGenerating = false;
      this.builder.selectedOutlineId = record.outline[0]?.id ?? null;
      this.builder.imagePrompts = [];
      this.builder.imageLoading = false;
      this.builder.exportBusy = false;
      this.builder.shareUrl = record.seo.slug ? `/blog/${record.seo.slug}` : null;
      this.builder.aiUsage = { ...this.state.aiUsage };
      this.builder.toast = null;
      this.builder.keywordDraft = '';
      this.builder.newTag = '';
      writeJSON(STORAGE_KEYS.lastId, record.id);
    } finally {
      this.builder.loading = false;
      loaderStore()?.hide?.();
    }
  }
  private scheduleAutosave() {
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer);
    }
    this.autosaveTimer = setTimeout(() => {
      void this.saveDraft();
    }, 1200);
  }

  async saveDraft() {
    const id = this.builder.id;
    if (!id) return;
    const index = this.state.posts.findIndex((post) => post.id === id);
    if (index === -1) {
      this.state.posts.unshift(clone(this.builder.record));
    } else {
      this.state.posts[index] = clone(this.builder.record);
    }
    const now = new Date().toISOString();
    this.builder.record.lastSavedAt = now;
    this.builder.lastSavedLabel = formatRelativeTime(now);
    this.builder.autosaveLabel = 'Saved just now';
    this.builder.hasUnsavedChanges = false;
    const targetIndex = index === -1 ? 0 : index;
    this.state.posts[targetIndex].lastSavedAt = now;
    this.state.posts[targetIndex].wordCount = this.builder.stats.wordCount;
    this.state.posts[targetIndex].readingMinutes = this.builder.stats.readingMinutes;
    this.state.posts[targetIndex].ideaTopic = this.builder.ideaTopic || null;
    this.state.posts[targetIndex].outline = clone(this.builder.record.outline);
    this.state.posts[targetIndex].tags = [...this.builder.record.tags];
    this.state.posts[targetIndex].summary = this.builder.record.summary;
    this.state.posts[targetIndex].seo = clone(this.builder.record.seo);
    this.state.posts[targetIndex].media = clone(this.builder.record.media);
    this.updateMetrics();
    this.refreshActivity();
    this.persist();
  }

  touchBuilder() {
    this.builder.hasUnsavedChanges = true;
    this.builder.autosaveLabel = 'Saving…';
    this.scheduleAutosave();
  }

  setBuilderTab(tab: BuilderTab) {
    this.builder.tab = tab;
  }

  updateTitle(title: string) {
    this.builder.record.title = title;
    if (!this.builder.record.summary) {
      this.builder.record.summary = summarizeContent(this.builder.record.contentMd);
    }
    this.touchBuilder();
  }

  updateSummary(summary: string) {
    this.builder.record.summary = summary;
    this.touchBuilder();
  }

  updateContent(content: string) {
    this.builder.record.contentMd = content;
    const stats = computePostStats(this.builder.record);
    this.builder.stats = stats;
    this.builder.record.wordCount = stats.wordCount;
    this.builder.record.readingMinutes = stats.readingMinutes;
    this.touchBuilder();
  }
  updateIdeaTopic(topic: string) {
    this.builder.ideaTopic = topic;
    this.touchBuilder();
  }

  addTag(tag: string) {
    const normalized = tag.trim();
    if (!normalized) return;
    if (!this.builder.record.tags.includes(normalized)) {
      this.builder.record.tags.push(normalized);
      this.touchBuilder();
    }
    this.builder.newTag = '';
  }

  removeTag(tag: string) {
    this.builder.record.tags = this.builder.record.tags.filter((item) => item !== tag);
    this.touchBuilder();
  }

  addKeyword(keyword: string) {
    const normalized = keyword.trim();
    if (!normalized) return;
    if (!this.builder.record.seo.keywords.includes(normalized)) {
      this.builder.record.seo.keywords.push(normalized);
      this.touchBuilder();
    }
    this.builder.keywordDraft = '';
  }

  removeKeyword(keyword: string) {
    this.builder.record.seo.keywords = this.builder.record.seo.keywords.filter((item) => item !== keyword);
    this.touchBuilder();
  }

  selectOutlineNode(id: string) {
    this.builder.selectedOutlineId = id;
  }
  insertOutlineNode(position: OutlineInsertionPosition) {
    const currentId = this.builder.selectedOutlineId;
    if (!currentId) {
      const node = { id: newId(), title: 'New section', depth: 2 as const, summary: '', wordGoal: 180 };
      this.builder.record.outline.push(node);
      this.builder.selectedOutlineId = node.id;
      this.touchBuilder();
      return;
    }
    const walk = (nodes: BlogPostRecord['outline']): boolean => {
      for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index]!;
        if (node.id === currentId) {
          const newNode = { id: newId(), title: 'New section', depth: node.depth, summary: '', wordGoal: 160 };
          if (position === 'before') {
            nodes.splice(index, 0, newNode);
            return true;
          }
          if (position === 'after') {
            nodes.splice(index + 1, 0, newNode);
            return true;
          }
          if (position === 'child') {
            if (!node.children) node.children = [];
            node.children.push({
              id: newId(),
              title: 'Nested point',
              depth: (node.depth + 1) as 1 | 2 | 3,
              summary: '',
              wordGoal: 120,
            });
            return true;
          }
        }
        if (node.children && node.children.length > 0) {
          const found = walk(node.children);
          if (found) return true;
        }
      }
      return false;
    };
    walk(this.builder.record.outline);
    this.touchBuilder();
  }

  updateOutlineTitle(id: string, title: string) {
    const walk = (nodes: BlogPostRecord['outline']) => {
      nodes.forEach((node) => {
        if (node.id === id) {
          node.title = title;
        } else if (node.children) {
          walk(node.children);
        }
      });
    };
    walk(this.builder.record.outline);
    this.touchBuilder();
  }

  removeOutlineNode(id: string) {
    const remove = (nodes: BlogPostRecord['outline']): BlogPostRecord['outline'] =>
      nodes
        .filter((node) => node.id !== id)
        .map((node) => ({
          ...node,
          children: node.children ? remove(node.children) : undefined,
        }));
    this.builder.record.outline = remove(this.builder.record.outline);
    if (this.builder.selectedOutlineId === id) {
      this.builder.selectedOutlineId = this.builder.record.outline[0]?.id ?? null;
    }
    this.touchBuilder();
  }
  async generateIdeas() {
    if (!this.builder.ideaTopic) return;
    this.builder.ideaLoading = true;
    this.builder.toast = null;
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const ideas = filterIdeasByTopic(this.builder.ideaTopic).map((idea, index) => ({
        ...idea,
        id: `${idea.id}-${index}`,
      }));
      this.builder.ideas = ideas;
      this.builder.aiUsage.ideas += 1;
      this.state.aiUsage.ideas += 1;
      this.builder.record.ideaTopic = this.builder.ideaTopic;
      this.builder.record.lastIdeaGeneratedAt = new Date().toISOString();
      this.touchBuilder();
    } catch (error) {
      console.error('Failed to generate ideas', error);
      this.pushToast('Could not generate ideas right now.', 'error');
    } finally {
      this.builder.ideaLoading = false;
    }
  }

  chooseIdea(idea: BlogAiIdea) {
    this.builder.selectedIdeaId = idea.id;
    this.builder.record.title = idea.headline;
    this.builder.record.summary = idea.summary;
    this.touchBuilder();
  }

  async generateOutlineFromIdea() {
    if (!this.builder.selectedIdeaId) {
      this.pushToast('Select an idea to generate an outline.', 'info');
      return;
    }
    this.builder.outlineGenerating = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const idea = this.builder.ideas.find((item) => item.id === this.builder.selectedIdeaId);
      if (!idea) return;
      const sections = idea.summary.split(/[.!?]/).filter((sentence) => sentence.trim().length > 0);
      const outline = sections.map((sentence, index) => ({
        id: newId(),
        title: sentence.trim(),
        depth: index === 0 ? 2 : ((index % 3 === 0 ? 3 : 2) as 1 | 2 | 3),
        summary: '',
        wordGoal: 180,
      }));
      if (!outline.length) {
        outline.push({ id: newId(), title: idea.headline, depth: 2, summary: '', wordGoal: 180 });
      }
      this.builder.record.outline = outline;
      this.builder.selectedOutlineId = outline[0]?.id ?? null;
      this.builder.aiUsage.outline += 1;
      this.state.aiUsage.outline += 1;
      this.touchBuilder();
    } finally {
      this.builder.outlineGenerating = false;
    }
  }
  async expandOutlineNode(id: string, mode: 'paragraphs' | 'bullets' | 'code' = 'paragraphs') {
    const node = this.findOutlineNode(id);
    if (!node) {
      this.pushToast('Select a section to expand.', 'info');
      return;
    }
    this.builder.aiUsage.expand += 1;
    this.state.aiUsage.expand += 1;
    this.pushToast('Drafting section with AI…', 'info');
    await new Promise((resolve) => setTimeout(resolve, 500));
    const heading = `## ${node.title}`;
    const addition =
      mode === 'bullets'
        ? `\n${heading}\n- Key takeaway aligned with ${node.title.toLowerCase()}\n- Supporting detail with metrics\n- Action step to implement`
        : mode === 'code'
          ? `\n${heading}\n\n\`\`\`js\n// Example snippet for ${node.title.toLowerCase()}\nconsole.log('Implement ${node.title.toLowerCase()} tips');\n\`\`\``
          : `\n${heading}\n\n${node.title} deserves a short paragraph exploring the why, the how, and the impact. Add context around success metrics and next steps.`;
    this.builder.record.contentMd = `${this.builder.record.contentMd}${addition}`.trim();
    this.updateContent(this.builder.record.contentMd);
  }

  private findOutlineNode(id: string | null): BlogPostRecord['outline'][number] | null {
    if (!id) return null;
    const walk = (nodes: BlogPostRecord['outline']): BlogPostRecord['outline'][number] | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const match = walk(node.children);
          if (match) return match;
        }
      }
      return null;
    };
    return walk(this.builder.record.outline);
  }

  async rewriteSelection(mode: 'clarify' | 'shorten' | 'expand') {
    this.builder.aiUsage.rewrite += 1;
    this.state.aiUsage.rewrite += 1;
    await new Promise((resolve) => setTimeout(resolve, 400));
    const note =
      mode === 'clarify'
        ? 'Clarified complex sentences for readability.'
        : mode === 'shorten'
          ? 'Tightened copy to stay punchy.'
          : 'Added richer context and examples to the selected paragraph.';
    this.pushToast(note, 'success');
  }
  async generateSeoInsights() {
    this.builder.aiUsage.seo += 1;
    this.state.aiUsage.seo += 1;
    this.builder.record.seo.title = this.builder.record.title || 'Untitled blog post';
    this.builder.record.seo.slug = slugify(this.builder.record.seo.title || 'draft-post');
    this.builder.record.seo.description =
      this.builder.record.summary || summarizeContent(this.builder.record.contentMd, 'Meta description ready for polish.');
    const headings = outlineToHeadings(this.builder.record.outline);
    this.builder.record.seo.keywords = Array.from(new Set([
      ...this.builder.record.seo.keywords,
      ...headings.slice(0, 4).map((heading) => heading.toLowerCase()),
    ]));
    this.builder.record.seo.internalLinks = [
      { label: 'Ansiversa dashboard', url: '/dashboard' },
      { label: 'Pricing', url: '/pricing' },
    ];
    this.builder.record.seo.score = Math.min(100, 65 + this.builder.record.seo.keywords.length * 4);
    this.builder.record.seo.readability = this.builder.stats.readingMinutes > 5 ? 'B' : 'A';
    this.builder.record.seo.tone = 'professional';
    this.builder.seoInsights = [
      {
        id: newId(),
        label: 'Meta description length',
        suggestion: this.builder.record.seo.description.length > 160 ? 'Trim to under 160 characters.' : 'Looking good!',
        positive: this.builder.record.seo.description.length <= 160,
      },
      {
        id: newId(),
        label: 'Internal links',
        suggestion: 'Link to your resume or features page to boost navigation.',
        positive: this.builder.record.seo.internalLinks.length >= 2,
      },
      {
        id: newId(),
        label: 'Reading level',
        suggestion: this.builder.record.seo.readability === 'A' ? 'Great readability for broad audiences.' : 'Consider shorter sentences.',
        positive: this.builder.record.seo.readability === 'A',
      },
    ];
    this.touchBuilder();
    this.pushToast('SEO insights updated.', 'success');
  }

  async generateImagePrompts() {
    this.builder.imageLoading = true;
    this.builder.aiUsage.image += 1;
    this.state.aiUsage.image += 1;
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.builder.imagePrompts = sampleImagePrompts.map((prompt) => ({ ...prompt, id: `${prompt.id}-${Date.now()}` }));
      this.pushToast('Image prompt ideas ready.', 'success');
    } finally {
      this.builder.imageLoading = false;
    }
  }

  addMediaFromPrompt(prompt: BlogAiPrompt) {
    const media: BlogMediaItem = {
      id: newId(),
      filename: `${prompt.aspect}-image-${Date.now()}.png`,
      url: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80',
      alt: prompt.description,
      width: 1400,
      height: 900,
      sizeKb: 420,
      createdAt: new Date().toISOString(),
      caption: prompt.description.slice(0, 80),
    };
    this.builder.record.media.push(media);
    this.touchBuilder();
  }

  removeMedia(id: string) {
    this.builder.record.media = this.builder.record.media.filter((item) => item.id !== id);
    this.touchBuilder();
  }

  addVersion(label?: string) {
    const versionLabel = label?.trim() || `Snapshot ${new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}`;
    this.builder.record.versions.unshift({
      id: newId(),
      label: versionLabel,
      createdAt: new Date().toISOString(),
      wordCount: this.builder.stats.wordCount,
      diffSummary: 'Captured current draft with outline and SEO updates.',
    });
    this.touchBuilder();
  }

  restoreVersion(id: string) {
    const version = this.builder.record.versions.find((item) => item.id === id);
    if (!version) return;
    this.pushToast(`Restored ${version.label}.`, 'success');
  }
  async publishDraft() {
    const id = this.builder.id;
    if (!id) return;
    const slug = this.builder.record.seo.slug || slugify(this.builder.record.title || 'new-post');
    this.builder.record.seo.slug = slug;
    this.builder.record.status = 'published';
    this.builder.record.publishedAt = new Date().toISOString();
    this.builder.shareUrl = `/blog/${slug}`;
    this.pushToast('Post published! View it on the public blog.', 'success');
    await this.saveDraft();
  }

  async exportDraft(format: BuilderExportFormat) {
    this.builder.exportBusy = true;
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.builder.exportBusy = false;
    this.pushToast(`Exported draft as ${format.toUpperCase()}.`, 'success');
  }

  setPlan(plan: Plan) {
    this.state.plan = plan;
    this.persist();
    this.refreshAdmin();
  }

  pushToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.builder.toast = { message, type };
    setTimeout(() => {
      if (this.builder.toast?.message === message) {
        this.builder.toast = null;
      }
    }, 3000);
  }

  describeTemplate(template: BlogTemplate) {
    return describeTemplateDifficulty(template.difficulty);
  }

  formatRelative(input?: string | null) {
    return formatRelativeTime(input);
  }

  formatDate(input?: string | null) {
    return formatDateLabel(input);
  }
}

const init = () => {
  if (Alpine.store('blog-writer')) return;
  Alpine.store('blog-writer', new BlogWriterStore());
};

if (typeof window !== 'undefined') {
  document.addEventListener('alpine:init', init);
  init();
}
