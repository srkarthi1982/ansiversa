import type { ResumeDocument } from '../schema';
import { buildRenderModel } from './helpers';

const escapeMarkdown = (value: string): string => value.replace(/([*_`])/g, '\\$1');

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export function renderResumeToMarkdown(document: ResumeDocument): string {
  const render = buildRenderModel(document);
  const lines: string[] = [];

  lines.push(`# ${escapeMarkdown(render.fullName || 'Untitled Resume')}`);
  if (render.title) {
    lines.push(`*${escapeMarkdown(render.title)}*`);
  }
  if (render.contactLine) {
    lines.push(render.contactLine);
  }
  lines.push('');

  if (render.summary) {
    lines.push('## Summary');
    lines.push(render.summary);
    lines.push('');
  }

  if (render.experiences.length > 0) {
    lines.push('## Experience');
    render.experiences.forEach((experience) => {
      const headingParts = [experience.heading, experience.organization, experience.location]
        .map((part) => escapeMarkdown(part))
        .filter(Boolean)
        .join(' · ');
      const title = headingParts || 'Experience';
      const timeframe = experience.timeframe ? ` (${experience.timeframe})` : '';
      lines.push(`### ${title}${timeframe}`);
      if (experience.bullets.length > 0) {
        experience.bullets.forEach((bullet) => {
          lines.push(`- ${escapeMarkdown(bullet)}`);
        });
      }
      lines.push('');
    });
  }

  if (render.skills.length > 0) {
    lines.push('## Skills');
    lines.push(render.skills.map((skill) => escapeMarkdown(skill)).join(', '));
    lines.push('');
  }

  if (render.educations.length > 0) {
    lines.push('## Education');
    render.educations.forEach((education) => {
      const headingParts = [education.heading, education.institution]
        .map((part) => escapeMarkdown(part))
        .filter(Boolean)
        .join(' · ');
      const timeframe = education.timeframe ? ` (${education.timeframe})` : '';
      lines.push(`### ${headingParts || 'Education'}${timeframe}`);
      education.details.forEach((detail) => {
        lines.push(`- ${escapeMarkdown(detail)}`);
      });
      lines.push('');
    });
  }

  if (render.projects.length > 0) {
    lines.push('## Projects');
    render.projects.forEach((project) => {
      const heading = escapeMarkdown(project.heading || 'Project');
      const details: string[] = [project.description, project.url]
        .map((value) => escapeMarkdown(value ?? ''))
        .filter(Boolean);
      lines.push(`### ${heading}`);
      details.forEach((detail) => lines.push(`- ${detail}`));
      lines.push('');
    });
  }

  if (render.certificates.length > 0) {
    lines.push('## Certificates');
    render.certificates.forEach((certificate) => {
      const line = [certificate.heading, certificate.issuer, certificate.year]
        .map((value) => escapeMarkdown(value))
        .filter(Boolean)
        .join(' · ');
      if (line) {
        lines.push(`- ${line}`);
      }
      if (certificate.url) {
        lines.push(`  - ${escapeMarkdown(certificate.url)}`);
      }
    });
    lines.push('');
  }

  if (render.links.length > 0) {
    lines.push('## Links');
    render.links.forEach((link) => {
      const label = escapeMarkdown(link.label);
      const url = escapeMarkdown(link.url);
      lines.push(`- [${label}](${url})`);
    });
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

export function renderResumeToHtml(document: ResumeDocument): string {
  const render = buildRenderModel(document);
  const sections: string[] = [];

  sections.push('<!DOCTYPE html>');
  sections.push('<html lang="en"><head>');
  sections.push('<meta charset="utf-8" />');
  sections.push(
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
  );
  sections.push('<title>Resume Export</title>');
  sections.push(
    '<style>body{font-family:Arial,Helvetica,sans-serif;color:#1f2937;margin:40px;}h1{font-size:28px;margin-bottom:4px;}h2{font-size:20px;margin-top:28px;margin-bottom:8px;}h3{font-size:16px;margin-top:16px;margin-bottom:4px;}ul{padding-left:20px;}section{margin-bottom:20px;}p{line-height:1.6;margin:4px 0;} .meta{color:#6b7280;font-size:14px;}</style>',
  );
  sections.push('</head><body>');

  sections.push(`<header><h1>${escapeHtml(render.fullName || 'Untitled Resume')}</h1>`);
  if (render.title) {
    sections.push(`<p class="meta">${escapeHtml(render.title)}</p>`);
  }
  if (render.contactLine) {
    sections.push(`<p class="meta">${escapeHtml(render.contactLine)}</p>`);
  }
  sections.push('</header>');

  if (render.summary) {
    sections.push('<section>');
    sections.push('<h2>Summary</h2>');
    sections.push(`<p>${escapeHtml(render.summary)}</p>`);
    sections.push('</section>');
  }

  if (render.experiences.length > 0) {
    sections.push('<section>');
    sections.push('<h2>Experience</h2>');
    render.experiences.forEach((experience) => {
      const headingParts = [experience.heading, experience.organization, experience.location]
        .map((value) => escapeHtml(value))
        .filter(Boolean)
        .join(' · ');
      sections.push('<article>');
      sections.push(`<h3>${headingParts || 'Experience'}</h3>`);
      if (experience.timeframe) {
        sections.push(`<p class="meta">${escapeHtml(experience.timeframe)}</p>`);
      }
      if (experience.bullets.length > 0) {
        sections.push('<ul>');
        experience.bullets.forEach((bullet) => {
          sections.push(`<li>${escapeHtml(bullet)}</li>`);
        });
        sections.push('</ul>');
      }
      sections.push('</article>');
    });
    sections.push('</section>');
  }

  if (render.skills.length > 0) {
    sections.push('<section>');
    sections.push('<h2>Skills</h2>');
    sections.push(`<p>${render.skills.map((skill) => escapeHtml(skill)).join(', ')}</p>`);
    sections.push('</section>');
  }

  if (render.educations.length > 0) {
    sections.push('<section>');
    sections.push('<h2>Education</h2>');
    render.educations.forEach((education) => {
      const headingParts = [education.heading, education.institution]
        .map((value) => escapeHtml(value))
        .filter(Boolean)
        .join(' · ');
      sections.push('<article>');
      sections.push(`<h3>${headingParts || 'Education'}</h3>`);
      if (education.timeframe) {
        sections.push(`<p class="meta">${escapeHtml(education.timeframe)}</p>`);
      }
      if (education.details.length > 0) {
        sections.push('<ul>');
        education.details.forEach((detail) => {
          sections.push(`<li>${escapeHtml(detail)}</li>`);
        });
        sections.push('</ul>');
      }
      sections.push('</article>');
    });
    sections.push('</section>');
  }

  if (render.projects.length > 0) {
    sections.push('<section>');
    sections.push('<h2>Projects</h2>');
    render.projects.forEach((project) => {
      sections.push('<article>');
      sections.push(`<h3>${escapeHtml(project.heading || 'Project')}</h3>`);
      if (project.description) {
        sections.push(`<p>${escapeHtml(project.description)}</p>`);
      }
      if (project.url) {
        sections.push(`<p class="meta"><a href="${escapeHtml(project.url)}">${escapeHtml(project.url)}</a></p>`);
      }
      sections.push('</article>');
    });
    sections.push('</section>');
  }

  if (render.certificates.length > 0) {
    sections.push('<section>');
    sections.push('<h2>Certificates</h2>');
    sections.push('<ul>');
    render.certificates.forEach((certificate) => {
      const line = [certificate.heading, certificate.issuer, certificate.year]
        .map((value) => escapeHtml(value))
        .filter(Boolean)
        .join(' · ');
      sections.push(`<li>${line}`);
      if (certificate.url) {
        sections.push(` <span class="meta">${escapeHtml(certificate.url)}</span>`);
      }
      sections.push('</li>');
    });
    sections.push('</ul>');
    sections.push('</section>');
  }

  if (render.links.length > 0) {
    sections.push('<section>');
    sections.push('<h2>Links</h2>');
    sections.push('<ul>');
    render.links.forEach((link) => {
      sections.push(
        `<li><a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a></li>`,
      );
    });
    sections.push('</ul>');
    sections.push('</section>');
  }

  sections.push('</body></html>');
  return sections.join('\n');
}
