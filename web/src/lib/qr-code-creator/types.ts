import type { QrPlanTier, QrMode, QrContentTypeId } from './constants';

export type QrEccLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrGradientStyle {
  from: string;
  to: string;
  angle: number;
}

export interface QrLogoAsset {
  name: string;
  dataUrl: string;
  size: number;
}

export interface QrStyleState {
  size: number;
  margin: number;
  ecc: QrEccLevel;
  foreground: string;
  background: string;
  quietZoneColor: string;
  gradientEnabled: boolean;
  gradient: QrGradientStyle;
  dotStyle: 'square' | 'rounded' | 'dots';
  eyeStyle: 'square' | 'rounded' | 'circle' | 'diamond';
  logo: QrLogoAsset | null;
}

export interface QrContentValues {
  [key: string]: string | boolean | null | undefined;
}

export interface QrPreviewState {
  payload: string;
  imageUrl: string;
  overlayStyle: string;
  updatedAt: number;
  mode: QrMode;
  note?: string | null;
}

export interface QrDynamicRecord {
  id: string;
  label: string;
  shortCode: string;
  shortUrl: string;
  targetUrl: string;
  status: 'active' | 'paused';
  plan: QrPlanTier;
  tags: string[];
  createdAt: string;
  lastScanAt: string;
  scanCount: number;
  campaign?: string;
  recentScans?: {
    id: string;
    scannedAt: string;
    location: string;
    country: string;
    device: string;
    platform: string;
  }[];
}

export interface QrDynamicAccessRules {
  password: string;
  requirePassword: boolean;
  expiresAt: string;
  geoAllow: string[];
  geoBlock: string[];
  notes: string;
}

export interface QrScanMetric {
  timestamp: string;
  total: number;
}

export interface QrBatchRowResult {
  id: string;
  rowNumber: number;
  label: string;
  type: QrContentTypeId;
  payload: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  message?: string;
  fileName?: string;
}

export interface QrBatchJobState {
  csvText: string;
  processing: boolean;
  startedAt: number | null;
  completedAt: number | null;
  results: QrBatchRowResult[];
  downloadUrl: string | null;
  error: string | null;
}

export interface QrToastState {
  type: 'success' | 'error' | 'info';
  message: string;
  id: number;
}

export interface DynamicAnalyticsSnapshot {
  rolling7Day: {
    total: number;
    change: number;
    byPlatform: { platform: string; percent: number }[];
  };
  topCountries: { country: string; percent: number }[];
  hourDistribution: number[];
}

export type ShortLinkHistoryPoint = {
  timestamp: string;
  scans: number;
};

export interface QrWorkspaceState {
  plan: QrPlanTier;
  mode: QrMode;
  contentType: QrContentTypeId;
  values: QrContentValues;
  style: QrStyleState;
  preview: QrPreviewState;
  toast: QrToastState | null;
  dynamic: {
    records: QrDynamicRecord[];
    selectedId: string | null;
    access: QrDynamicAccessRules;
    analytics: DynamicAnalyticsSnapshot;
    history: ShortLinkHistoryPoint[];
    form: {
      label: string;
      targetUrl: string;
      campaign: string;
      tags: string;
    };
  };
  batch: QrBatchJobState;
}
