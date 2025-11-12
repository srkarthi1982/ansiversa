import Alpine from 'alpinejs';
import { BaseStore } from '../../../alpineStores/base';
import {
  batchCsvTemplate,
  defaultQrStyle,
  qrContentTypes,
  qrDotShapeOptions,
  qrEyeStyleOptions,
  qrGradientPresets,
  qrMarginOptions,
  qrSizeOptions,
  sampleDynamicRecords,
  type QrContentTypeDefinition,
  type QrContentTypeId,
  type QrPlanTier,
} from '../../../lib/qr-code-creator/constants';
import {
  buildDownloadName,
  buildHistory,
  buildQrImageUrl,
  cloneStyle,
  computeOverlayClass,
  createAnalyticsSummary,
  createGradientStyle,
  createZipArchive,
  defaultValuesForType,
  encodeQrPayload,
  ensureDataUrl,
  ensureHttps,
  findContentType,
  generateShortCode,
  mergeValues,
  parseCsv,
  slugify,
  toUint8Array,
} from '../../../lib/qr-code-creator/utils';
import type {
  QrBatchRowResult,
  QrContentValues,
  QrDynamicRecord,
  QrPreviewState,
  QrStyleState,
  QrToastState,
  QrWorkspaceState,
} from '../../../lib/qr-code-creator/types';

const MAX_BATCH_ROWS = 50;

const createToast = (type: QrToastState['type'], message: string): QrToastState => ({
  type,
  message,
  id: Date.now(),
});

const createBatchResults = (): QrBatchRowResult[] => [];

const initialDynamicRecords = sampleDynamicRecords.map((record) => ({
  ...record,
}));

const createPreview = (mode: 'static' | 'dynamic'): QrPreviewState => ({
  payload: '',
  imageUrl: '',
  overlayStyle: '',
  updatedAt: Date.now(),
  mode,
  note: 'Enter content to render your QR code preview.',
});

const createInitialState = (): QrWorkspaceState => ({
  plan: 'free',
  mode: 'static',
  contentType: 'url',
  values: defaultValuesForType('url'),
  style: cloneStyle(defaultQrStyle),
  preview: createPreview('static'),
  toast: null,
  dynamic: {
    records: initialDynamicRecords,
    selectedId: initialDynamicRecords[0]?.id ?? null,
    access: {
      password: '',
      requirePassword: false,
      expiresAt: '',
      geoAllow: ['US', 'IN'],
      geoBlock: [],
      notes: '',
    },
    analytics: createAnalyticsSummary(),
    history: buildHistory(),
    form: {
      label: 'New campaign QR',
      targetUrl: 'https://ansiversa.com/',
      campaign: 'spring_launch',
      tags: 'promo,print',
    },
  },
  batch: {
    csvText: batchCsvTemplate,
    processing: false,
    startedAt: null,
    completedAt: null,
    results: createBatchResults(),
    downloadUrl: null,
    error: null,
  },
});

const parseBatchValues = (type: QrContentTypeId, value: string): QrContentValues => {
  const parts = value.split('|');
  switch (type) {
    case 'url':
      return { url: parts[0] ?? '' };
    case 'text':
      return { message: parts[0] ?? '' };
    case 'wifi': {
      return {
        ssid: parts[0] ?? '',
        security: parts[1] ?? 'WPA',
        password: parts[2] ?? '',
        hidden: parts[3] === 'true',
      };
    }
    case 'email':
      return { address: parts[0] ?? '', subject: parts[1] ?? '', body: parts[2] ?? '' };
    case 'sms':
      return { number: parts[0] ?? '', message: parts[1] ?? '' };
    case 'whatsapp':
      return { number: parts[0] ?? '', message: parts[1] ?? '' };
    case 'geo':
      return { latitude: parts[0] ?? '', longitude: parts[1] ?? '', label: parts[2] ?? '' };
    case 'payment':
      return {
        provider: parts[0] ?? 'stripe',
        amount: parts[1] ?? '',
        currency: parts[2] ?? 'USD',
        reference: parts[3] ?? '',
        note: parts[4] ?? '',
      };
    case 'contact':
      return {
        firstName: parts[0] ?? '',
        lastName: parts[1] ?? '',
        email: parts[2] ?? '',
        phone: parts[3] ?? '',
        company: parts[4] ?? '',
        title: parts[5] ?? '',
      };
    case 'event':
      return {
        title: parts[0] ?? '',
        location: parts[1] ?? '',
        start: parts[2] ?? '',
        end: parts[3] ?? '',
        description: parts[4] ?? '',
      };
    case 'social':
      return {
        username: parts[0] ?? '',
        landingUrl: parts[1] ?? '',
        primaryNetwork: parts[2] ?? 'instagram',
        cta: parts[3] ?? '',
      };
    case 'phone':
      return { number: parts[0] ?? '' };
    default:
      return { value };
  }
};

class QrCodeCreatorStore extends BaseStore {
  state: QrWorkspaceState = createInitialState();

  get contentDefinition(): QrContentTypeDefinition {
    return findContentType(this.state.contentType);
  }

  get previewImageUrl(): string {
    return this.state.preview.imageUrl;
  }

  get overlayStyle(): string {
    return this.state.preview.overlayStyle;
  }

  get overlayClass(): string {
    return computeOverlayClass(this.state.style);
  }

  get hasLogo(): boolean {
    return Boolean(this.state.style.logo);
  }

  get selectedDynamic(): QrDynamicRecord | null {
    const id = this.state.dynamic.selectedId;
    if (!id) return this.state.dynamic.records[0] ?? null;
    return this.state.dynamic.records.find((record) => record.id === id) ?? null;
  }

  get gradientPresets() {
    return qrGradientPresets;
  }

  get dotOptions() {
    return qrDotShapeOptions;
  }

  get eyeOptions() {
    return qrEyeStyleOptions;
  }

  get sizeOptions() {
    return qrSizeOptions;
  }

  get marginOptions() {
    return qrMarginOptions;
  }

  onInit(): void {
    this.refreshPreview();
  }

  setPlan(plan: QrPlanTier): void {
    this.state.plan = plan;
  }

  setMode(mode: 'static' | 'dynamic'): void {
    this.state.mode = mode;
    if (mode === 'dynamic' && this.state.plan === 'free') {
      this.state.plan = 'pro';
      this.setToast('info', 'Dynamic QR requires the Pro plan. Previewing in Pro mode.');
    }
    this.state.preview.mode = mode;
    this.refreshPreview();
  }

  setContentType(type: QrContentTypeId): void {
    this.state.contentType = type;
    this.state.values = defaultValuesForType(type);
    const definition = findContentType(type);
    if (definition.plan === 'pro' && this.state.plan === 'free') {
      this.state.plan = 'pro';
      this.setToast('info', `${definition.label} content is unlocked on the Pro plan.`);
    }
    this.refreshPreview();
  }

  updateField(key: string, value: string | boolean): void {
    this.state.values = mergeValues(this.state.values, { [key]: value });
    this.refreshPreview();
  }

  updateStyle(updates: Partial<QrStyleState>): void {
    this.state.style = { ...this.state.style, ...updates };
    this.refreshPreview();
  }

  setGradientPreset(presetId: string): void {
    const preset = qrGradientPresets.find((item) => item.id === presetId);
    if (!preset) return;
    this.state.style.gradient = { from: preset.from, to: preset.to, angle: preset.angle };
    this.state.style.gradientEnabled = true;
    this.refreshPreview();
  }

  toggleGradient(enabled: boolean): void {
    this.state.style.gradientEnabled = enabled;
    this.refreshPreview();
  }

  async setLogo(file: File): Promise<void> {
    try {
      const logo = await ensureDataUrl(file);
      this.state.style.logo = logo;
      this.refreshPreview();
      this.setToast('success', 'Logo added to preview.');
    } catch (error) {
      this.setToast('error', error instanceof Error ? error.message : 'Failed to read logo file.');
    }
  }

  removeLogo(): void {
    this.state.style.logo = null;
    this.refreshPreview();
  }

  refreshPreview(): void {
    const { mode, contentType, values, style } = this.state;
    let payload = '';
    let note: string | null = null;

    if (mode === 'dynamic') {
      const record = this.selectedDynamic;
      if (record) {
        payload = record.shortUrl;
      } else {
        note = 'Create a dynamic QR to preview the code.';
      }
    } else {
      const result = encodeQrPayload(contentType, values);
      payload = result.payload;
      note = result.note ?? null;
    }

    this.state.preview.payload = payload;
    this.state.preview.mode = mode;
    this.state.preview.note = note;
    this.state.preview.updatedAt = Date.now();

    if (!payload) {
      this.state.preview.imageUrl = '';
      this.state.preview.overlayStyle = '';
      return;
    }

    this.state.preview.imageUrl = buildQrImageUrl(payload, style, 'svg');
    this.state.preview.overlayStyle = createGradientStyle(style);
  }

  async download(format: 'svg' | 'png'): Promise<void> {
    const payload = this.state.preview.payload;
    if (!payload) {
      this.setToast('error', 'Provide content to download your QR code.');
      return;
    }
    const url = buildQrImageUrl(payload, this.state.style, format);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Unable to fetch QR image.');
      const blob = await response.blob();
      const filename = buildDownloadName(`${this.state.mode}-${this.state.contentType}`, format);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      requestAnimationFrame(() => {
        document.body.removeChild(anchor);
        URL.revokeObjectURL(objectUrl);
      });
      this.setToast('success', `Downloading ${format.toUpperCase()} preview.`);
    } catch (error) {
      this.setToast('error', error instanceof Error ? error.message : 'Download failed.');
    }
  }

  setToast(type: QrToastState['type'], message: string): void {
    this.state.toast = createToast(type, message);
    setTimeout(() => {
      if (this.state.toast?.message === message) {
        this.state.toast = null;
      }
    }, 4000);
  }

  clearToast(id: number): void {
    if (this.state.toast?.id === id) {
      this.state.toast = null;
    }
  }

  selectDynamic(id: string): void {
    this.state.dynamic.selectedId = id;
    const record = this.selectedDynamic;
    if (record) {
      this.state.dynamic.form = {
        label: record.label,
        targetUrl: record.targetUrl,
        campaign: record.campaign ?? '',
        tags: record.tags.join(', '),
      };
    }
    this.refreshPreview();
  }

  updateDynamicField(field: 'label' | 'targetUrl' | 'campaign' | 'tags', value: string): void {
    this.state.dynamic.form[field] = value;
  }

  updateDynamicRecord(updates: Partial<QrDynamicRecord>): void {
    const record = this.selectedDynamic;
    if (!record) return;
    Object.assign(record, updates);
    record.lastScanAt = new Date().toISOString();
    this.refreshPreview();
  }

  regenerateShortCode(): void {
    const record = this.selectedDynamic;
    if (!record) return;
    record.shortCode = generateShortCode();
    record.shortUrl = `https://ansv.rs/${record.shortCode}`;
    this.refreshPreview();
    this.setToast('success', 'Generated a new short code.');
  }

  toggleDynamicStatus(): void {
    const record = this.selectedDynamic;
    if (!record) return;
    record.status = record.status === 'active' ? 'paused' : 'active';
    this.setToast('success', `Dynamic QR ${record.status === 'active' ? 'activated' : 'paused'}.`);
  }

  applyDynamicTarget(): void {
    const record = this.selectedDynamic;
    if (!record) return;
    const { form } = this.state.dynamic;
    const nextUrl = ensureHttps(form.targetUrl || record.targetUrl);
    record.targetUrl = nextUrl;
    record.label = form.label || record.label;
    if (form.campaign) {
      record.campaign = form.campaign;
    } else {
      delete record.campaign;
    }
    record.tags = form.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    record.lastScanAt = new Date().toISOString();
    this.refreshPreview();
    this.setToast('success', 'Updated dynamic redirect target.');
  }

  createDynamicRecord(): void {
    const form = this.state.dynamic.form;
    const label = form.label || 'Untitled dynamic QR';
    const shortCode = generateShortCode();
    const shortUrl = `https://ansv.rs/${shortCode}`;
    const now = new Date().toISOString();
    const record: QrDynamicRecord = {
      id: `qr_dyn_${Date.now()}`,
      label,
      shortCode,
      shortUrl,
      targetUrl: ensureHttps(form.targetUrl || 'https://ansiversa.com'),
      status: 'active',
      plan: 'pro',
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      createdAt: now,
      lastScanAt: now,
      scanCount: 0,
      campaign: form.campaign || undefined,
    };
    this.state.dynamic.records.unshift(record);
    this.state.dynamic.selectedId = record.id;
    this.state.dynamic.form = {
      label: 'New campaign QR',
      targetUrl: 'https://ansiversa.com/',
      campaign: 'spring_launch',
      tags: 'promo,print',
    };
    this.refreshPreview();
    this.setToast('success', 'Dynamic QR created. Share the short link to track scans.');
  }

  async simulateScanIncrement(): Promise<void> {
    const record = this.selectedDynamic;
    if (!record) return;
    record.scanCount += 1;
    record.lastScanAt = new Date().toISOString();
    this.state.dynamic.analytics = createAnalyticsSummary();
    this.state.dynamic.history = buildHistory();
    this.setToast('success', 'Recorded a simulated scan event.');
  }

  async processBatch(): Promise<void> {
    const batch = this.state.batch;
    if (batch.processing) return;
    batch.processing = true;
    batch.startedAt = Date.now();
    batch.completedAt = null;
    batch.results = [];
    batch.error = null;
    if (batch.downloadUrl) {
      URL.revokeObjectURL(batch.downloadUrl);
      batch.downloadUrl = null;
    }

    try {
      const rows = parseCsv(batch.csvText);
      if (rows.length <= 1) {
        throw new Error('CSV must include a header row and at least one data row.');
      }
      const header = rows[0]!.map((cell) => cell.toLowerCase());
      const typeIndex = header.indexOf('type');
      const labelIndex = header.indexOf('label');
      const valueIndex = header.indexOf('value');
      if (typeIndex === -1 || valueIndex === -1) {
        throw new Error('Expected columns "type" and "value" in the CSV header.');
      }

      const files: { name: string; data: Uint8Array }[] = [];
      const results: QrBatchRowResult[] = [];
      const limit = Math.min(rows.length - 1, MAX_BATCH_ROWS);

      for (let i = 1; i <= limit; i += 1) {
        const cells = rows[i]!;
        const type = (cells[typeIndex] ?? '').toLowerCase() as QrContentTypeId;
        const label = cells[labelIndex] ?? `Row ${i}`;
        const rawValue = cells[valueIndex] ?? '';
        const result: QrBatchRowResult = {
          id: `row_${i}_${Date.now()}`,
          rowNumber: i,
          label,
          type,
          payload: '',
          status: 'processing',
        };
        results.push(result);

        const definition = qrContentTypes.find((item) => item.id === type);
        if (!definition) {
          result.status = 'error';
          result.message = `Unsupported type "${type}".`;
          continue;
        }

        const values = parseBatchValues(type, rawValue);
        const payloadResult = encodeQrPayload(type, values);
        if (!payloadResult.payload) {
          result.status = 'error';
          result.message = 'Missing required fields for this content type.';
          continue;
        }

        result.payload = payloadResult.payload;
        const fileLabel = label || `${type}-${i}`;
        const fileName = buildDownloadName(fileLabel, 'svg');
        result.fileName = fileName;

        const imageUrl = buildQrImageUrl(payloadResult.payload, this.state.style, 'svg');
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error('Failed to fetch SVG payload.');
          const svgText = await response.text();
          files.push({ name: fileName, data: toUint8Array(svgText) });
          result.status = 'success';
        } catch (error) {
          result.status = 'error';
          result.message = error instanceof Error ? error.message : 'Download failed for this row.';
        }
      }

      batch.results = results;
      batch.completedAt = Date.now();

      if (files.length > 0) {
        const archive = createZipArchive(files);
        const blob = new Blob([archive], { type: 'application/zip' });
        batch.downloadUrl = URL.createObjectURL(blob);
        this.setToast('success', `Batch ready with ${files.length} QR codes.`);
      } else {
        this.setToast('error', 'No valid rows were processed.');
      }
    } catch (error) {
      batch.error = error instanceof Error ? error.message : 'Batch processing failed.';
      this.setToast('error', batch.error);
    } finally {
      batch.processing = false;
    }
  }
}

if (!Alpine.store('qr-code-creator')) {
  Alpine.store('qr-code-creator', new QrCodeCreatorStore());
}

export type QrCodeCreatorStoreType = QrCodeCreatorStore;
