import { defaultQrStyle, qrContentTypes, type QrContentTypeDefinition, type QrContentTypeId } from './constants';
import type {
  DynamicAnalyticsSnapshot,
  QrContentValues,
  QrLogoAsset,
  QrPreviewState,
  QrStyleState,
} from './types';

const URL_SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:/i;
const PHONE_SANITIZE_REGEX = /[^0-9+]/g;

export const findContentType = (id: QrContentTypeId): QrContentTypeDefinition =>
  qrContentTypes.find((type) => type.id === id) ?? qrContentTypes[0]!;

export const stripHex = (value: string): string => value.replace(/^#/, '').trim();

export const normalizeUrl = (value: string, fallback = 'https'): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (URL_SCHEME_REGEX.test(trimmed)) {
    return trimmed;
  }
  return `${fallback}://${trimmed}`;
};

export const sanitizePhoneNumber = (value: string): string => value.replace(PHONE_SANITIZE_REGEX, '');

const encodeMailto = (values: QrContentValues): string => {
  const address = String(values.address ?? '').trim();
  const subject = String(values.subject ?? '').trim();
  const body = String(values.body ?? '').trim();
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString();
  if (!address) return '';
  return query ? `mailto:${address}?${query}` : `mailto:${address}`;
};

const encodeSms = (values: QrContentValues): string => {
  const number = sanitizePhoneNumber(String(values.number ?? ''));
  const message = String(values.message ?? '').trim();
  if (!number) return '';
  const encodedMessage = message ? `:${encodeURIComponent(message)}` : '';
  return `SMSTO:${number}${encodedMessage}`;
};

const encodeWhatsapp = (values: QrContentValues): string => {
  const number = sanitizePhoneNumber(String(values.number ?? ''));
  const message = String(values.message ?? '').trim();
  if (!number) return '';
  const base = `https://wa.me/${number.replace(/^\+/, '')}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
};

const encodeWifi = (values: QrContentValues): string => {
  const ssid = String(values.ssid ?? '').trim();
  const security = String(values.security ?? 'WPA');
  const password = String(values.password ?? '').trim();
  const hidden = Boolean(values.hidden);
  if (!ssid) return '';
  const sanitizedSecurity = security === 'nopass' ? 'nopass' : security;
  const builder = [
    'WIFI:',
    `T:${sanitizedSecurity};`,
    `S:${ssid};`,
    password ? `P:${password};` : '',
    `H:${hidden ? 'true' : 'false'};`,
    ';',
  ];
  return builder.join('');
};

const encodeContact = (values: QrContentValues): string => {
  const firstName = String(values.firstName ?? '').trim();
  const lastName = String(values.lastName ?? '').trim();
  const company = String(values.company ?? '').trim();
  const title = String(values.title ?? '').trim();
  const email = String(values.email ?? '').trim();
  const phone = sanitizePhoneNumber(String(values.phone ?? ''));
  const website = String(values.website ?? '').trim();
  const address = String(values.address ?? '').trim();

  if (!firstName && !lastName && !email) return '';

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${[firstName, lastName].filter(Boolean).join(' ')}`,
  ];
  if (company) lines.push(`ORG:${company}`);
  if (title) lines.push(`TITLE:${title}`);
  if (phone) lines.push(`TEL;TYPE=WORK,VOICE:${phone}`);
  if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`);
  if (website) lines.push(`URL:${normalizeUrl(website)}`);
  if (address) lines.push(`ADR;TYPE=WORK:;;${address.replace(/\n+/g, ';')}`);
  lines.push('END:VCARD');
  return lines.join('\n');
};

const encodeEvent = (values: QrContentValues): string => {
  const title = String(values.title ?? '').trim() || 'Untitled event';
  const description = String(values.description ?? '').trim();
  const location = String(values.location ?? '').trim();
  const start = String(values.start ?? '').trim();
  const end = String(values.end ?? '').trim();

  const toUtc = (input: string): string => {
    if (!input) return '';
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  };

  const startUtc = toUtc(start);
  const endUtc = toUtc(end);

  const lines = [
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
  ];
  if (description) lines.push(`DESCRIPTION:${description.replace(/\n/g, '\\n')}`);
  if (location) lines.push(`LOCATION:${location}`);
  if (startUtc) lines.push(`DTSTART:${startUtc}`);
  if (endUtc) lines.push(`DTEND:${endUtc}`);
  lines.push('END:VEVENT');
  return lines.join('\n');
};

const encodeGeo = (values: QrContentValues): string => {
  const latitude = String(values.latitude ?? '').trim();
  const longitude = String(values.longitude ?? '').trim();
  const label = String(values.label ?? '').trim();
  if (!latitude || !longitude) return '';
  const coords = `${latitude},${longitude}`;
  return label ? `geo:${coords}?q=${encodeURIComponent(`${coords} (${label})`)}` : `geo:${coords}`;
};

const encodePayment = (values: QrContentValues): string => {
  const provider = String(values.provider ?? '').trim() || 'stripe';
  const amount = String(values.amount ?? '').trim();
  const currency = String(values.currency ?? '').trim().toUpperCase() || 'USD';
  const reference = String(values.reference ?? '').trim();
  const note = String(values.note ?? '').trim();

  switch (provider) {
    case 'upi': {
      const params = new URLSearchParams();
      if (reference) params.set('pa', reference);
      params.set('cu', currency || 'INR');
      if (amount) params.set('am', amount);
      if (note) params.set('tn', note);
      return `upi://pay?${params.toString()}`;
    }
    case 'paypal': {
      const base = 'https://paypal.me';
      const slug = reference ? `/${encodeURIComponent(reference)}` : '';
      return amount ? `${base}${slug}/${amount}${currency}` : `${base}${slug}`;
    }
    case 'razorpay': {
      const base = 'https://rzp.io/l';
      const slug = reference ? `/${encodeURIComponent(reference)}` : '/ansiversa';
      return `${base}${slug}`;
    }
    case 'stripe':
    default: {
      const base = 'https://pay.ansiversa.com';
      const slug = reference ? `/link/${encodeURIComponent(reference)}` : '/checkout';
      const params = new URLSearchParams();
      if (amount) params.set('amount', amount);
      if (currency) params.set('currency', currency);
      if (note) params.set('note', note);
      const query = params.toString();
      return query ? `${base}${slug}?${query}` : `${base}${slug}`;
    }
  }
};

const encodeSocial = (values: QrContentValues): string => {
  const usernameRaw = String(values.username ?? '').trim();
  const username = usernameRaw.replace(/^@/, '') || 'ansiversa';
  const landingUrl = String(values.landingUrl ?? '').trim();
  if (landingUrl) return normalizeUrl(landingUrl);
  return `https://ansiversa.com/social/${encodeURIComponent(username)}`;
};

const contentEncoders: Record<QrContentTypeId, (values: QrContentValues) => string> = {
  url: (values) => {
    const baseUrl = normalizeUrl(String(values.url ?? ''));
    if (!baseUrl) return '';
    const appendUtm = Boolean(values.appendUtm);
    const campaign = String(values.campaign ?? '').trim() || 'ansiversa';
    if (!appendUtm) return baseUrl;
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', 'qr');
    url.searchParams.set('utm_medium', 'print');
    url.searchParams.set('utm_campaign', campaign);
    return url.toString();
  },
  text: (values) => String(values.message ?? '').trim(),
  email: encodeMailto,
  phone: (values) => {
    const number = sanitizePhoneNumber(String(values.number ?? ''));
    return number ? `tel:${number}` : '';
  },
  sms: encodeSms,
  whatsapp: encodeWhatsapp,
  wifi: encodeWifi,
  contact: encodeContact,
  event: encodeEvent,
  geo: encodeGeo,
  payment: encodePayment,
  social: encodeSocial,
};

export interface EncodePayloadResult {
  payload: string;
  note?: string | null;
}

export const encodeQrPayload = (
  type: QrContentTypeId,
  values: QrContentValues,
): EncodePayloadResult => {
  const encoder = contentEncoders[type];
  const payload = encoder ? encoder(values) : '';
  return { payload, note: payload ? null : 'Provide required fields to generate the QR payload.' };
};

export const resolveInitialValues = (type: QrContentTypeId): QrContentValues => {
  const definition = findContentType(type);
  const defaults: QrContentValues = {};
  definition.fields.forEach((field) => {
    if (field.type === 'toggle') {
      defaults[field.key] = false;
    } else if (field.key === 'security') {
      defaults[field.key] = 'WPA';
    } else if (field.key === 'primaryNetwork') {
      defaults[field.key] = 'instagram';
    } else if (field.key === 'provider') {
      defaults[field.key] = 'stripe';
    } else {
      defaults[field.key] = '';
    }
  });
  if (type === 'url') {
    defaults.url = definition.samplePayload;
  }
  if (type === 'text') {
    defaults.message = definition.samplePayload;
  }
  if (type === 'wifi') {
    defaults.password = 'CreateTogether';
    defaults.ssid = 'AnsiversaLab';
  }
  if (type === 'payment') {
    defaults.amount = '49.00';
    defaults.currency = 'USD';
  }
  return defaults;
};

export const resolvePreviewState = (mode: 'static' | 'dynamic'): QrPreviewState => ({
  payload: '',
  imageUrl: '',
  overlayStyle: '',
  updatedAt: Date.now(),
  mode,
  note: 'Configure the payload to preview your QR code.',
});

export const cloneStyle = (style: QrStyleState = defaultQrStyle): QrStyleState => ({
  size: style.size,
  margin: style.margin,
  ecc: style.ecc,
  foreground: style.foreground,
  background: style.background,
  quietZoneColor: style.quietZoneColor,
  gradientEnabled: style.gradientEnabled,
  gradient: { ...style.gradient },
  dotStyle: style.dotStyle,
  eyeStyle: style.eyeStyle,
  logo: style.logo ? { ...style.logo } : null,
});

export const createGradientStyle = (style: QrStyleState): string => {
  if (!style.gradientEnabled) return '';
  const gradient = style.gradient ?? { from: '#6366f1', to: '#0ea5e9', angle: 125 };
  return `linear-gradient(${gradient.angle}deg, ${gradient.from}, ${gradient.to})`;
};

export const parseCsv = (input: string): string[][] => {
  const lines = input.split(/\r?\n/).filter((line) => line.trim().length > 0);
  return lines.map((line) => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i]!;
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current);
    return cells.map((cell) => cell.trim());
  });
};

export const generateShortCode = (length = 7): string => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * alphabet.length);
    result += alphabet[index];
  }
  return result;
};

export const slugify = (value: string, fallback = 'qr-code'): string => {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 50);
  return normalized || fallback;
};

export const buildHistory = (days = 14): { timestamp: string; scans: number }[] => {
  const now = new Date();
  const series: { timestamp: string; scans: number }[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    series.push({
      timestamp: date.toISOString(),
      scans: Math.max(8, Math.round(40 + Math.random() * 40 - 20)),
    });
  }
  return series;
};

export const createAnalyticsSummary = (): DynamicAnalyticsSnapshot => ({
  rolling7Day: {
    total: 128,
    change: 12,
    byPlatform: [
      { platform: 'iOS', percent: 46 },
      { platform: 'Android', percent: 39 },
      { platform: 'Desktop', percent: 12 },
      { platform: 'Other', percent: 3 },
    ],
  },
  topCountries: [
    { country: 'United States', percent: 41 },
    { country: 'India', percent: 18 },
    { country: 'Germany', percent: 12 },
    { country: 'Canada', percent: 9 },
  ],
  hourDistribution: Array.from({ length: 24 }, (_, hour) => Math.max(2, Math.round(8 + Math.sin(hour / 2) * 5 + Math.random() * 4))),
});

export interface ZipFileEntry {
  name: string;
  data: Uint8Array;
  modified?: Date;
}

const createCrcTable = (): Uint32Array => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let crc = i;
    for (let j = 0; j < 8; j += 1) {
      if ((crc & 1) !== 0) {
        crc = 0xedb88320 ^ (crc >>> 1);
      } else {
        crc >>>= 1;
      }
    }
    table[i] = crc >>> 0;
  }
  return table;
};

const CRC_TABLE = createCrcTable();

const crc32 = (input: Uint8Array): number => {
  let crc = 0xffffffff;
  for (let i = 0; i < input.length; i += 1) {
    const byte = input[i]!;
    crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const writeUint16 = (buffer: DataView, offset: number, value: number): void => {
  buffer.setUint16(offset, value & 0xffff, true);
};

const writeUint32 = (buffer: DataView, offset: number, value: number): void => {
  buffer.setUint32(offset, value >>> 0, true);
};

const dateToDosTime = (date: Date): { time: number; date: number } => {
  const year = date.getFullYear();
  const dosYear = year < 1980 ? 0 : year - 1980;
  return {
    time: ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | ((date.getSeconds() / 2) & 0x1f),
    date: (dosYear << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
};

export const createZipArchive = (files: ZipFileEntry[]): Uint8Array => {
  const entries = files.map((file) => {
    const data = file.data;
    const nameBytes = new TextEncoder().encode(file.name);
    const crc = crc32(data);
    const compressedSize = data.length;
    const uncompressedSize = data.length;
    const modified = file.modified ?? new Date();
    const dos = dateToDosTime(modified);
    return {
      data,
      nameBytes,
      crc,
      compressedSize,
      uncompressedSize,
      dos,
    };
  });

  let offset = 0;
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];

  entries.forEach((entry, index) => {
    const localHeaderSize = 30 + entry.nameBytes.length;
    const localBuffer = new ArrayBuffer(localHeaderSize);
    const localView = new DataView(localBuffer);
    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, 20);
    writeUint16(localView, 6, 0);
    writeUint16(localView, 8, 0);
    writeUint16(localView, 10, entry.dos.time);
    writeUint16(localView, 12, entry.dos.date);
    writeUint32(localView, 14, entry.crc);
    writeUint32(localView, 18, entry.compressedSize);
    writeUint32(localView, 22, entry.uncompressedSize);
    writeUint16(localView, 26, entry.nameBytes.length);
    writeUint16(localView, 28, 0);
    const localArray = new Uint8Array(localBuffer);
    localArray.set(entry.nameBytes, 30);
    localParts.push(localArray, entry.data);

    const centralHeaderSize = 46 + entry.nameBytes.length;
    const centralBuffer = new ArrayBuffer(centralHeaderSize);
    const centralView = new DataView(centralBuffer);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, 20);
    writeUint16(centralView, 6, 20);
    writeUint16(centralView, 8, 0);
    writeUint16(centralView, 10, 0);
    writeUint16(centralView, 12, entry.dos.time);
    writeUint16(centralView, 14, entry.dos.date);
    writeUint32(centralView, 16, entry.crc);
    writeUint32(centralView, 20, entry.compressedSize);
    writeUint32(centralView, 24, entry.uncompressedSize);
    writeUint16(centralView, 28, entry.nameBytes.length);
    writeUint16(centralView, 30, 0);
    writeUint16(centralView, 32, 0);
    writeUint16(centralView, 34, 0);
    writeUint16(centralView, 36, 0);
    writeUint32(centralView, 38, 0);
    writeUint32(centralView, 42, offset);
    const centralArray = new Uint8Array(centralBuffer);
    centralArray.set(entry.nameBytes, 46);
    centralParts.push(centralArray);

    offset += localHeaderSize + entry.data.length;
    void index;
  });

  const centralLength = centralParts.reduce((total, part) => total + part.length, 0);
  const localLength = localParts.reduce((total, part) => total + part.length, 0);

  const endBuffer = new ArrayBuffer(22);
  const endView = new DataView(endBuffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, entries.length);
  writeUint16(endView, 10, entries.length);
  writeUint32(endView, 12, centralLength);
  writeUint32(endView, 16, localLength);
  writeUint16(endView, 20, 0);

  const totalSize = localLength + centralLength + endBuffer.byteLength;
  const result = new Uint8Array(totalSize);
  let cursor = 0;
  localParts.forEach((part) => {
    result.set(part, cursor);
    cursor += part.length;
  });
  centralParts.forEach((part) => {
    result.set(part, cursor);
    cursor += part.length;
  });
  result.set(new Uint8Array(endBuffer), cursor);
  return result;
};

export const ensureDataUrl = (file: File): Promise<QrLogoAsset> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '');
      resolve({ name: file.name, dataUrl, size: file.size });
    };
    reader.onerror = () => reject(new Error('Failed to read logo file.'));
    reader.readAsDataURL(file);
  });

export const toUint8Array = (input: string): Uint8Array => new TextEncoder().encode(input);

export const buildDownloadName = (base: string, extension: string): string => {
  const slug = slugify(base);
  return `${slug}.${extension}`;
};

export const buildQrImageUrl = (
  payload: string,
  style: QrStyleState,
  format: 'png' | 'svg' = 'svg',
): string => {
  const params = new URLSearchParams();
  params.set('text', payload);
  params.set('size', String(style.size));
  params.set('margin', String(style.margin));
  params.set('ecLevel', style.ecc);
  params.set('format', format);
  params.set('dark', stripHex(style.foreground));
  params.set('light', stripHex(style.background));
  params.set('download', '0');
  return `https://quickchart.io/qr?${params.toString()}`;
};

export const computeOverlayClass = (style: QrStyleState): string => {
  const base = 'absolute inset-0 rounded-[18px] pointer-events-none';
  if (!style.gradientEnabled) return `${base} opacity-0`;
  return `${base} opacity-90 mix-blend-multiply`;
};

export const formatRelative = (input: string): string => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '—';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (60 * 1000));
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, 'day');
};

export const formatDate = (input: string): string => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

export const mergeValues = (current: QrContentValues, updates: Partial<QrContentValues>): QrContentValues => ({
  ...current,
  ...updates,
});

export const ensureHttps = (url: string): string => {
  if (!url) return '';
  try {
    const parsed = new URL(normalizeUrl(url));
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      parsed.protocol = 'https:';
    }
    return parsed.toString();
  } catch (error) {
    void error;
    return normalizeUrl(url);
  }
};

export const defaultValuesForType = (type: QrContentTypeId): QrContentValues => resolveInitialValues(type);
