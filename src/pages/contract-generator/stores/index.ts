import Alpine from 'alpinejs';
import { BaseStore, clone } from '../../../alpineStores/base';
import { actions } from 'astro:actions';
import {
  contractTemplates,
  contractTemplateKeys,
  contractToneOptions,
  type ContractTemplateKey,
  type ContractStatus,
  type ContractTone,
  type ContractVariables,
  type ContractClauses,
  type ContractVersion,
  type ContractClauseLibraryEntry,
  defaultContractTitle,
  createEmptyContractData,
} from '../../../lib/contract/schema';
import {
  describeContractSummary,
  applyVariablesToClauses,
  getTemplateLabel,
  nowIso,
} from '../../../lib/contract/utils';

const contractActions = actions['contract-generator'];

const formatRelative = (dateString?: string | null) => {
  if (!dateString) return 'never';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'invalid';
  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, 'minute');
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 48) {
    return formatter.format(diffHours, 'hour');
  }
  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, 'day');
};

type ContractRecord = {
  id: string;
  userId: string;
  title: string;
  templateKey: ContractTemplateKey;
  type: string;
  status: ContractStatus;
  slug: string | null;
  variables: ContractVariables;
  clauses: ContractClauses;
  versions: ContractVersion[];
  options: { watermark: boolean; locale: string; includeSignatureBlock: boolean };
  notes: string | null;
  lastSavedAt: string | null;
  createdAt: string | null;
};

type AutosaveTimer = ReturnType<typeof setTimeout> | null;

type BuilderInitInput = {
  id?: string | null;
};

type WizardData = {
  clientName: string;
  clientAddress: string;
  providerName: string;
  providerAddress: string;
  scope: string;
  deliverables: string;
  fee: string;
  paymentSchedule: string;
  startDate: string;
  endDate: string;
  jurisdiction: string;
  currency: string;
  templateKey: ContractTemplateKey;
  includeConfidentiality: boolean;
  includeIpAssignment: boolean;
  includeLiabilityCap: boolean;
};

type ToastState = { message: string; type: 'success' | 'error' } | null;

type ClauseLibraryState = {
  loading: boolean;
  items: ContractClauseLibraryEntry[];
};

class ContractStore extends BaseStore {
  state = {
    loading: false,
    contracts: [] as ContractRecord[],
    filtered: [] as ContractRecord[],
    filters: {
      template: 'all' as ContractTemplateKey | 'all',
      status: 'all' as ContractStatus | 'all',
      search: '',
    },
  };

  builder = {
    id: null as string | null,
    title: defaultContractTitle,
    templateKey: contractTemplateKeys[0] as ContractTemplateKey,
    status: 'draft' as ContractStatus,
    type: contractTemplateKeys[0] as ContractTemplateKey,
    variables: createEmptyContractData().variables,
    clauses: createEmptyContractData().clauses,
    versions: [] as ContractVersion[],
    options: createEmptyContractData().options,
    notes: '' as string | null,
    loading: false,
    hasUnsavedChanges: false,
    lastSavedLabel: null as string | null,
    autosaveLabel: null as string | null,
    aiTone: contractToneOptions[0] as ContractTone,
    aiBusy: false,
    shareUrl: null as string | null,
    clauseSearch: '',
    plan: 'free' as 'free' | 'pro',
    toast: null as ToastState,
  };

  wizard = {
    step: 0,
    data: {
      clientName: '',
      clientAddress: '',
      providerName: '',
      providerAddress: '',
      scope: '',
      deliverables: '',
      fee: '',
      paymentSchedule: '',
      startDate: '',
      endDate: '',
      jurisdiction: '',
      currency: createEmptyContractData().variables.Currency,
      templateKey: contractTemplateKeys[0] as ContractTemplateKey,
      includeConfidentiality: true,
      includeIpAssignment: true,
      includeLiabilityCap: true,
    } as WizardData,
    busy: false,
    error: '' as string | null,
    completedContractId: null as string | null,
  };

  clauseLibrary: ClauseLibraryState = {
    loading: false,
    items: [],
  };

  templates = contractTemplates;

  private autosaveTimer: AutosaveTimer = null;

  onInit(location?: Location) {
    const pathname = location?.pathname ?? window.location.pathname;
    if (pathname.startsWith('/contract-generator/builder')) {
      return;
    }
    if (pathname.startsWith('/contract-generator/wizard')) {
      this.resetWizard();
      return;
    }
    if (pathname.startsWith('/contract-generator')) {
      this.initDashboard();
    }
  }

  initDashboard() {
    if (!this.state.loading && this.state.contracts.length === 0) {
      void this.loadList();
    }
  }

  async loadList() {
    this.state.loading = true;
    this.loader?.show();
    try {
      const { data, error } = await contractActions.list({});
      if (error) throw error;
      const items = (data?.items ?? []) as ContractRecord[];
      this.state.contracts = items;
      this.applyFilters();
    } catch (error) {
      console.error('Unable to load contracts', error);
      this.state.contracts = [];
      this.state.filtered = [];
    } finally {
      this.state.loading = false;
      this.loader?.hide();
    }
  }

  applyFilters() {
    const { template, status, search } = this.state.filters;
    const query = search.toLowerCase().trim();
    const filtered = this.state.contracts.filter((contract) => {
      if (template !== 'all' && contract.templateKey !== template) return false;
      if (status !== 'all' && contract.status !== status) return false;
      if (query.length > 0) {
        const haystack = `${contract.title} ${contract.variables.ClientName ?? ''}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    this.state.filtered = filtered;
  }

  setFilter(key: 'template' | 'status' | 'search', value: any) {
    (this.state.filters as any)[key] = value;
    this.applyFilters();
  }

  describe(contract: ContractRecord) {
    return describeContractSummary({
      variables: contract.variables,
      clauses: contract.clauses,
      versions: contract.versions,
      notes: contract.notes,
      options: contract.options,
    });
  }

  formatRelative(dateString?: string | null) {
    return formatRelative(dateString);
  }

  async createDraft(templateKey?: ContractTemplateKey) {
    try {
      this.loader?.show();
      const { data, error } = await contractActions.create(
        templateKey ? { templateKey } : {},
      );
      if (error) throw error;
      if (data?.contract) {
        const contract = data.contract as ContractRecord;
        this.upsertListRecord(contract);
        this.applyFilters();
        window.location.assign(`/contract-generator/builder?id=${contract.id}`);
      }
    } catch (error) {
      console.error('Unable to create contract', error);
      this.pushToast('Could not create contract. Try again.', 'error');
    } finally {
      this.loader?.hide();
    }
  }

  async duplicate(id: string) {
    try {
      this.loader?.show();
      const { data, error } = await contractActions.duplicate({ id });
      if (error) throw error;
      if (data?.contract) {
        this.upsertListRecord(data.contract as ContractRecord);
        this.applyFilters();
        this.pushToast('Contract duplicated', 'success');
      }
    } catch (error) {
      console.error('Unable to duplicate contract', error);
      this.pushToast('Duplicate failed.', 'error');
    } finally {
      this.loader?.hide();
    }
  }

  async delete(id: string) {
    if (!confirm('Delete this contract? This action cannot be undone.')) {
      return;
    }
    try {
      this.loader?.show();
      const { error } = await contractActions.delete({ id });
      if (error) throw error;
      this.state.contracts = this.state.contracts.filter((item) => item.id !== id);
      this.applyFilters();
      this.pushToast('Contract deleted', 'success');
    } catch (error) {
      console.error('Unable to delete contract', error);
      this.pushToast('Delete failed.', 'error');
    } finally {
      this.loader?.hide();
    }
  }

  upsertListRecord(record: ContractRecord) {
    const existingIndex = this.state.contracts.findIndex((item) => item.id === record.id);
    if (existingIndex >= 0) {
      this.state.contracts.splice(existingIndex, 1, record);
    } else {
      this.state.contracts.unshift(record);
    }
  }

  async initBuilder(options: BuilderInitInput) {
    if (this.builder.loading) return;
    this.builder.loading = true;
    this.loader?.show();
    try {
      await this.loadClauseLibrary();
      if (options.id) {
        const { data, error } = await contractActions.get({ id: options.id });
        if (error) throw error;
        if (data?.contract) {
          this.setBuilderRecord(data.contract as ContractRecord);
        }
      } else {
        const { data, error } = await contractActions.create({});
        if (error) throw error;
        if (data?.contract) {
          const contract = data.contract as ContractRecord;
          this.setBuilderRecord(contract);
          window.history.replaceState({}, '', `/contract-generator/builder?id=${contract.id}`);
        }
      }
    } catch (error) {
      console.error('Unable to initialise contract builder', error);
      this.pushToast('Unable to load contract.', 'error');
    } finally {
      this.builder.loading = false;
      this.loader?.hide();
    }
  }

  setBuilderRecord(record: ContractRecord) {
    this.builder.id = record.id;
    this.builder.title = record.title;
    this.builder.templateKey = record.templateKey;
    this.builder.status = record.status;
    this.builder.type = record.type as ContractTemplateKey;
    this.builder.variables = clone(record.variables);
    this.builder.clauses = clone(record.clauses);
    this.builder.versions = clone(record.versions ?? []);
    this.builder.options = clone(record.options ?? createEmptyContractData().options);
    this.builder.notes = record.notes ?? '';
    this.builder.lastSavedLabel = formatRelative(record.lastSavedAt ?? record.createdAt ?? nowIso());
    this.builder.autosaveLabel = null;
    this.builder.hasUnsavedChanges = false;
    this.builder.shareUrl = record.slug ? `/contract-generator/view/${record.slug}` : null;
    this.upsertListRecord(record);
    this.applyFilters();
  }

  markDirty() {
    this.builder.hasUnsavedChanges = true;
    this.builder.autosaveLabel = 'Saving...';
    this.scheduleAutosave();
  }

  scheduleAutosave() {
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer);
    }
    this.autosaveTimer = setTimeout(() => {
      void this.saveNow();
    }, 1200);
  }

  cancelAutosave() {
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer);
      this.autosaveTimer = null;
    }
  }

  async saveNow() {
    if (!this.builder.id) return;
    this.cancelAutosave();
    try {
      const payload = {
        id: this.builder.id,
        title: this.builder.title,
        templateKey: this.builder.templateKey,
        status: this.builder.status,
        variables: this.builder.variables,
        clauses: this.builder.clauses,
        versions: this.builder.versions,
        options: this.builder.options,
        notes: this.builder.notes,
      };
      const { data, error } = await contractActions.save(payload);
      if (error) throw error;
      if (data?.contract) {
        const record = data.contract as ContractRecord;
        this.builder.lastSavedLabel = formatRelative(record.lastSavedAt ?? nowIso());
        this.builder.hasUnsavedChanges = false;
        this.builder.autosaveLabel = 'Saved';
        setTimeout(() => {
          this.builder.autosaveLabel = null;
        }, 1800);
        this.setBuilderRecord(record);
      }
    } catch (error) {
      console.error('Unable to save contract', error);
      this.pushToast('Autosave failed.', 'error');
      this.builder.autosaveLabel = 'Retrying...';
      this.scheduleAutosave();
    }
  }

  updateTitle(value: string) {
    this.builder.title = value;
    this.markDirty();
  }

  updateTemplate(key: ContractTemplateKey) {
    if (key === this.builder.templateKey) return;
    this.builder.templateKey = key;
    this.builder.type = key;
    const template = contractTemplates.find((template) => template.key === key);
    if (template?.defaultClauses) {
      this.builder.clauses = {
        ...this.builder.clauses,
        ...clone(template.defaultClauses),
      } as ContractClauses;
    }
    this.markDirty();
  }

  updateStatus(status: ContractStatus) {
    this.builder.status = status;
    this.markDirty();
  }

  updateVariable(key: keyof ContractVariables, value: string) {
    this.builder.variables = { ...this.builder.variables, [key]: value } as ContractVariables;
    this.markDirty();
  }

  updateClause(key: keyof ContractClauses, value: string) {
    this.builder.clauses = { ...this.builder.clauses, [key]: value } as ContractClauses;
    this.markDirty();
  }

  updateNotes(value: string) {
    this.builder.notes = value;
    this.markDirty();
  }

  resolvedPreview() {
    return applyVariablesToClauses(this.builder.clauses, this.builder.variables);
  }

  async loadClauseLibrary() {
    if (this.clauseLibrary.items.length > 0 || this.clauseLibrary.loading) {
      return;
    }
    this.clauseLibrary.loading = true;
    try {
      const { data, error } = await contractActions.library({});
      if (error) throw error;
      this.clauseLibrary.items = (data?.items ?? []) as ContractClauseLibraryEntry[];
    } catch (error) {
      console.error('Unable to load clause library', error);
    } finally {
      this.clauseLibrary.loading = false;
    }
  }

  get filteredClauseLibrary() {
    const query = this.builder.clauseSearch.toLowerCase().trim();
    if (!query) return this.clauseLibrary.items;
    return this.clauseLibrary.items.filter((entry) =>
      [entry.title, entry.body].some((field) => field.toLowerCase().includes(query)),
    );
  }

  insertClause(entry: ContractClauseLibraryEntry, target: keyof ContractClauses) {
    const current = this.builder.clauses[target] ?? '';
    const combined = current ? `${current}\n\n${entry.body}` : entry.body;
    this.updateClause(target, combined);
  }

  async runClauseAI(target: keyof ContractClauses, mode: 'tighten' | 'draft' | 'translate' | 'simplify') {
    if (this.builder.aiBusy) return;
    this.builder.aiBusy = true;
    try {
      const text = this.builder.clauses[target] ?? '';
      const { data, error } = await contractActions.aiClause({
        text: text || `Clause for ${target}`,
        mode,
        tone: this.builder.aiTone,
      });
      if (error) throw error;
      if (data?.text) {
        this.updateClause(target, data.text as string);
        this.pushToast('Clause drafted with AI', 'success');
      }
    } catch (error) {
      console.error('AI clause request failed', error);
      this.pushToast('AI assistant unavailable. Try again.', 'error');
    } finally {
      this.builder.aiBusy = false;
    }
  }

  addVersion(label?: string) {
    const version: ContractVersion = {
      id: crypto.randomUUID(),
      label: label?.trim().length ? label : `Version ${this.builder.versions.length + 1}`,
      createdAt: nowIso(),
      clauses: clone(this.builder.clauses),
    };
    this.builder.versions = [version, ...this.builder.versions];
    this.markDirty();
  }

  restoreVersion(id: string) {
    const version = this.builder.versions.find((item) => item.id === id);
    if (!version) return;
    this.builder.clauses = clone(version.clauses);
    this.markDirty();
  }

  async publishCurrent() {
    if (!this.builder.id) return;
    try {
      this.loader?.show();
      const { data, error } = await contractActions.publish({ id: this.builder.id });
      if (error) throw error;
      if (data?.contract) {
        this.setBuilderRecord(data.contract as ContractRecord);
        this.pushToast('Contract published', 'success');
      }
    } catch (error) {
      console.error('Unable to publish contract', error);
      this.pushToast('Publish failed.', 'error');
    } finally {
      this.loader?.hide();
    }
  }

  async export(format: 'pdf' | 'docx' | 'md') {
    if (!this.builder.id) return;
    try {
      this.loader?.show();
      const { data, error } = await contractActions.export({ id: this.builder.id, format });
      if (error) throw error;
      const message = data?.message ?? 'Export requested.';
      this.pushToast(message, 'success');
    } catch (error) {
      console.error('Unable to export contract', error);
      this.pushToast('Export failed.', 'error');
    } finally {
      this.loader?.hide();
    }
  }

  pushToast(message: string, type: 'success' | 'error') {
    this.builder.toast = { message, type };
    setTimeout(() => {
      if (this.builder.toast?.message === message) {
        this.builder.toast = null;
      }
    }, 2800);
  }

  resetWizard() {
    this.wizard.step = 0;
    this.wizard.busy = false;
    this.wizard.error = null;
    this.wizard.completedContractId = null;
    this.wizard.data = {
      clientName: '',
      clientAddress: '',
      providerName: '',
      providerAddress: '',
      scope: '',
      deliverables: '',
      fee: '',
      paymentSchedule: '',
      startDate: '',
      endDate: '',
      jurisdiction: '',
      currency: createEmptyContractData().variables.Currency,
      templateKey: contractTemplateKeys[0] as ContractTemplateKey,
      includeConfidentiality: true,
      includeIpAssignment: true,
      includeLiabilityCap: true,
    };
  }

  nextWizardStep() {
    if (this.wizard.step < 5) {
      this.wizard.step += 1;
    }
  }

  prevWizardStep() {
    if (this.wizard.step > 0) {
      this.wizard.step -= 1;
    }
  }

  async completeWizard() {
    this.wizard.busy = true;
    this.wizard.error = null;
    try {
      const { data, error } = await contractActions.create({ templateKey: this.wizard.data.templateKey });
      if (error) throw error;
      const contract = data?.contract as ContractRecord | undefined;
      if (!contract) throw new Error('Unable to create wizard contract');

      const variables: ContractVariables = {
        ...contract.variables,
        ClientName: this.wizard.data.clientName || contract.variables.ClientName,
        ClientAddress: this.wizard.data.clientAddress || contract.variables.ClientAddress,
        ProviderName: this.wizard.data.providerName || contract.variables.ProviderName,
        ProviderAddress: this.wizard.data.providerAddress || contract.variables.ProviderAddress,
        ScopeSummary: this.wizard.data.scope || contract.variables.ScopeSummary,
        DeliverableSummary: this.wizard.data.deliverables || contract.variables.DeliverableSummary,
        ServiceFee: this.wizard.data.fee || contract.variables.ServiceFee,
        PaymentSchedule: this.wizard.data.paymentSchedule || contract.variables.PaymentSchedule,
        Jurisdiction: this.wizard.data.jurisdiction || contract.variables.Jurisdiction,
        StartDate: this.wizard.data.startDate || contract.variables.StartDate,
        EndDate: this.wizard.data.endDate || contract.variables.EndDate,
        Currency: this.wizard.data.currency || contract.variables.Currency,
      } as ContractVariables;

      const clauses = { ...contract.clauses } as ContractClauses;
      if (this.wizard.data.includeConfidentiality === false) {
        clauses.confidentiality = 'Confidentiality obligations will be agreed separately by the parties.';
      }
      if (this.wizard.data.includeIpAssignment === false) {
        clauses.intellectual_property = 'Each party retains ownership of its existing intellectual property.';
      }
      if (this.wizard.data.includeLiabilityCap === false) {
        clauses.liability = 'Liability will follow applicable law without a specific contractual cap.';
      }
      clauses.services = this.wizard.data.scope
        ? `${clauses.services}\n\nScope summary: ${this.wizard.data.scope}`
        : clauses.services;
      clauses.deliverables = this.wizard.data.deliverables
        ? `${clauses.deliverables}\n\nDeliverables: ${this.wizard.data.deliverables}`
        : clauses.deliverables;

      await contractActions.save({
        id: contract.id,
        variables,
        clauses,
        notes: contract.notes,
        templateKey: contract.templateKey,
      });

      this.wizard.completedContractId = contract.id;
      window.location.assign(`/contract-generator/builder?id=${contract.id}`);
    } catch (error) {
      console.error('Wizard completion failed', error);
      this.wizard.error = error instanceof Error ? error.message : 'Unexpected error';
    } finally {
      this.wizard.busy = false;
    }
  }

  templateLabel(key: ContractTemplateKey) {
    return getTemplateLabel(key);
  }
}

if (!Alpine.store('contract')) {
  Alpine.store('contract', new ContractStore());
}
