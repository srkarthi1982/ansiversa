import type { ResumeDocument } from '../schema';

type SanitizedString = string;

type RenderExperience = {
  heading: SanitizedString;
  organization: SanitizedString;
  location: SanitizedString;
  timeframe: SanitizedString;
  bullets: SanitizedString[];
};

type RenderEducation = {
  heading: SanitizedString;
  institution: SanitizedString;
  timeframe: SanitizedString;
  details: SanitizedString[];
};

type RenderLink = {
  label: SanitizedString;
  url: SanitizedString;
};

type RenderProject = {
  heading: SanitizedString;
  description: SanitizedString;
  url?: SanitizedString;
};

type RenderCertificate = {
  heading: SanitizedString;
  issuer: SanitizedString;
  year: SanitizedString;
  url?: SanitizedString;
};

export type RenderedResume = {
  fullName: SanitizedString;
  title: SanitizedString;
  contactLine: SanitizedString;
  summary: SanitizedString | null;
  experiences: RenderExperience[];
  educations: RenderEducation[];
  skills: SanitizedString[];
  projects: RenderProject[];
  certificates: RenderCertificate[];
  links: RenderLink[];
  locale: string;
  templateKey: string;
};

const sanitize = (value: unknown): SanitizedString =>
  String(value ?? '')
    .replace(/[\r\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const sanitizeMultiline = (value: unknown): SanitizedString[] => {
  const raw = String(value ?? '')
    .replace(/\r/g, '\n')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (raw.length === 0) {
    return [];
  }
  return raw;
};

const formatMonthYear = (input: string | null | undefined, locale: string): string => {
  if (!input) return '';
  const [yearString, monthString] = input.split('-');
  const year = Number.parseInt(yearString ?? '', 10);
  const month = Number.parseInt(monthString ?? '', 10);
  if (!Number.isFinite(year) || year < 1900) {
    return input;
  }
  try {
    if (Number.isFinite(month)) {
      const formatter = new Intl.DateTimeFormat(locale || 'en', { month: 'short', year: 'numeric' });
      return formatter.format(new Date(year, Math.max(0, month - 1)));
    }
    return `${year}`;
  } catch (error) {
    console.warn('Unable to format date value', input, error);
    return input;
  }
};

const formatDateRange = (
  start: string | null | undefined,
  end: string | null | undefined,
  options: { current?: boolean; locale: string },
): string => {
  const startLabel = formatMonthYear(start, options.locale);
  const endLabel = options.current ? 'Present' : formatMonthYear(end, options.locale);
  return [startLabel, endLabel].filter(Boolean).join(' – ');
};

const buildContactLine = (
  basics: ResumeDocument['data']['basics'],
): string => {
  return [basics.email, basics.phone, basics.location]
    .map((value) => sanitize(value))
    .filter(Boolean)
    .join(' • ');
};

export const buildRenderModel = (document: ResumeDocument): RenderedResume => {
  const locale = document.locale ?? 'en';
  const summary = sanitize(document.data.summary ?? '').slice(0, 2000);

  const experiences: RenderExperience[] = document.data.experience.map((entry) => ({
    heading: sanitize(entry.position ?? ''),
    organization: sanitize(entry.company ?? ''),
    location: sanitize(entry.location ?? ''),
    timeframe: formatDateRange(entry.start ?? '', entry.end ?? '', {
      current: Boolean(entry.current),
      locale,
    }),
    bullets: sanitizeMultiline(entry.description ?? ''),
  }));

  const educations: RenderEducation[] = document.data.education.map((entry) => ({
    heading: sanitize(entry.degree ?? ''),
    institution: sanitize(entry.school ?? ''),
    timeframe: formatDateRange(entry.start ?? '', entry.end ?? '', { current: false, locale }),
    details: sanitizeMultiline(entry.description ?? ''),
  }));

  const skills = document.data.skills.map((skill) => {
    const name = sanitize(skill.name);
    const level = sanitize(skill.level ?? '');
    return level ? `${name} (${level})` : name;
  });

  const projects: RenderProject[] = document.data.projects.map((project) => ({
    heading: sanitize(project.name ?? ''),
    description: sanitize(project.description ?? ''),
    url: sanitize(project.url ?? ''),
  }));

  const certificates: RenderCertificate[] = document.data.certificates.map((certificate) => ({
    heading: sanitize(certificate.name ?? ''),
    issuer: sanitize(certificate.issuer ?? ''),
    year: sanitize(certificate.year ?? ''),
    url: sanitize(certificate.url ?? ''),
  }));

  const links: RenderLink[] = document.data.links.map((link) => ({
    label: sanitize(link.label ?? link.url ?? ''),
    url: sanitize(link.url ?? ''),
  }));

  return {
    fullName: sanitize(document.data.basics.fullName || document.title || 'Untitled resume'),
    title: sanitize(document.data.basics.title ?? ''),
    contactLine: buildContactLine(document.data.basics),
    summary: summary || null,
    experiences,
    educations,
    skills: skills.filter(Boolean),
    projects: projects.filter((project) => project.heading || project.description),
    certificates: certificates.filter((certificate) => certificate.heading || certificate.issuer),
    links: links.filter((link) => link.label && link.url),
    locale,
    templateKey: document.templateKey,
  };
};

export type { RenderExperience, RenderEducation, RenderLink, RenderProject, RenderCertificate };
