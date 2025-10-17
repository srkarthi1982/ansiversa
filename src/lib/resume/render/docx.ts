import { Buffer } from 'node:buffer';
import type { ResumeDocument } from '../schema';
import { buildRenderModel } from './helpers';

type ZipFile = {
  name: string;
  content: Uint8Array;
};

const textEncoder = new TextEncoder();

const toUint8Array = (value: string | Uint8Array): Uint8Array =>
  typeof value === 'string' ? textEncoder.encode(value) : value;

const crc32Table = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c >>>= 1;
      }
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const crc32 = (bytes: Uint8Array): number => {
  let crc = 0 ^ -1;
  for (let i = 0; i < bytes.length; i += 1) {
    const byte = bytes[i];
    crc = (crc >>> 8) ^ crc32Table[(crc ^ byte) & 0xff];
  }
  return (crc ^ -1) >>> 0;
};

const getDosDateTime = (date = new Date()): { time: number; date: number } => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = Math.floor(date.getSeconds() / 2);
  const dosTime = (hours << 11) | (minutes << 5) | seconds;
  const dosDate = ((year - 1980) << 9) | (month << 5) | day;
  return { time: dosTime, date: dosDate };
};

const createZip = (files: ZipFile[]): Uint8Array => {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  const now = getDosDateTime();

  files.forEach((file) => {
    const fileName = Buffer.from(file.name, 'utf8');
    const content = Buffer.from(file.content);
    const fileCrc = crc32(content);
    const compressedSize = content.length;
    const uncompressedSize = content.length;

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(now.time, 10);
    localHeader.writeUInt16LE(now.date, 12);
    localHeader.writeUInt32LE(fileCrc >>> 0, 14);
    localHeader.writeUInt32LE(compressedSize, 18);
    localHeader.writeUInt32LE(uncompressedSize, 22);
    localHeader.writeUInt16LE(fileName.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, fileName, content);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(0x0314, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(now.time, 12);
    centralHeader.writeUInt16LE(now.date, 14);
    centralHeader.writeUInt32LE(fileCrc >>> 0, 16);
    centralHeader.writeUInt32LE(compressedSize, 20);
    centralHeader.writeUInt32LE(uncompressedSize, 24);
    centralHeader.writeUInt16LE(fileName.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, fileName);

    offset += localHeader.length + fileName.length + content.length;
  });

  const centralDirectory = Buffer.concat(centralParts);
  const centralSize = centralDirectory.length;
  const centralOffset = offset;

  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(files.length, 8);
  endRecord.writeUInt16LE(files.length, 10);
  endRecord.writeUInt32LE(centralSize, 12);
  endRecord.writeUInt32LE(centralOffset, 16);
  endRecord.writeUInt16LE(0, 20);

  const zipBuffer = Buffer.concat([...localParts, centralDirectory, endRecord]);
  return new Uint8Array(zipBuffer.buffer, zipBuffer.byteOffset, zipBuffer.length);
};

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const paragraph = (text: string, options: { bold?: boolean; size?: number } = {}): string => {
  const runs: string[] = [];
  runs.push('<w:r>');
  if (options.bold || options.size) {
    runs.push('<w:rPr>');
    if (options.bold) {
      runs.push('<w:b/>');
    }
    if (options.size) {
      runs.push(`<w:sz w:val="${options.size}"/><w:szCs w:val="${options.size}"/>`);
    }
    runs.push('</w:rPr>');
  }
  runs.push(`<w:t xml:space="preserve">${escapeXml(text)}</w:t>`);
  runs.push('</w:r>');
  return `<w:p>${runs.join('')}</w:p>`;
};

const paragraphWithStyle = (text: string, style: 'Title' | 'Heading1' | 'Heading2'): string =>
  `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr><w:r><w:t xml:space="preserve">${escapeXml(
    text,
  )}</w:t></w:r></w:p>`;

const bulletParagraph = (text: string): string =>
  `<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t xml:space="preserve">${escapeXml(
    text,
  )}</w:t></w:r></w:p>`;

const buildNumberingXml = (): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="•"/>
      <w:lvlJc w:val="left"/>
      <w:pPr>
        <w:ind w:left="720" w:hanging="360"/>
      </w:pPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1">
    <w:abstractNumId w:val="0"/>
  </w:num>
</w:numbering>`;

const buildDocumentXml = (document: ResumeDocument): string => {
  const render = buildRenderModel(document);
  const body: string[] = [];

  body.push(paragraphWithStyle(render.fullName || 'Untitled Resume', 'Title'));
  if (render.title) {
    body.push(paragraphWithStyle(render.title, 'Heading2'));
  }
  if (render.contactLine) {
    body.push(paragraph(render.contactLine));
  }

  if (render.summary) {
    body.push(paragraphWithStyle('Summary', 'Heading1'));
    body.push(paragraph(render.summary));
  }

  if (render.experiences.length > 0) {
    body.push(paragraphWithStyle('Experience', 'Heading1'));
    render.experiences.forEach((experience) => {
      const headingParts = [experience.heading, experience.organization, experience.location]
        .filter(Boolean)
        .join(' · ');
      body.push(paragraph(headingParts || 'Experience', { bold: true }));
      if (experience.timeframe) {
        body.push(paragraph(experience.timeframe));
      }
      experience.bullets.forEach((bullet) => body.push(bulletParagraph(bullet)));
    });
  }

  if (render.skills.length > 0) {
    body.push(paragraphWithStyle('Skills', 'Heading1'));
    body.push(paragraph(render.skills.join(', ')));
  }

  if (render.educations.length > 0) {
    body.push(paragraphWithStyle('Education', 'Heading1'));
    render.educations.forEach((education) => {
      const headingParts = [education.heading, education.institution]
        .filter(Boolean)
        .join(' · ');
      body.push(paragraph(headingParts || 'Education', { bold: true }));
      if (education.timeframe) {
        body.push(paragraph(education.timeframe));
      }
      education.details.forEach((detail) => body.push(bulletParagraph(detail)));
    });
  }

  if (render.projects.length > 0) {
    body.push(paragraphWithStyle('Projects', 'Heading1'));
    render.projects.forEach((project) => {
      body.push(paragraph(project.heading || 'Project', { bold: true }));
      if (project.description) {
        body.push(paragraph(project.description));
      }
      if (project.url) {
        body.push(paragraph(project.url));
      }
    });
  }

  if (render.certificates.length > 0) {
    body.push(paragraphWithStyle('Certificates', 'Heading1'));
    render.certificates.forEach((certificate) => {
      const line = [certificate.heading, certificate.issuer, certificate.year]
        .filter(Boolean)
        .join(' · ');
      body.push(paragraph(line));
      if (certificate.url) {
        body.push(paragraph(certificate.url));
      }
    });
  }

  if (render.links.length > 0) {
    body.push(paragraphWithStyle('Links', 'Heading1'));
    render.links.forEach((link) => {
      body.push(paragraph(`${link.label}: ${link.url}`));
    });
  }

  body.push(
    '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>',
  );

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body.join('\n    ')}
  </w:body>
</w:document>`;
};

const buildContentTypesXml = (): string => `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>`;

const buildRelsXml = (): string => `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const buildDocumentRelsXml = (): string => `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;

const buildCorePropsXml = (document: ResumeDocument): string => `<?xml version="1.0" encoding="UTF-8"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(document.title || 'Resume')}</dc:title>
  <dc:creator>${escapeXml(document.userId || 'Ansiversa User')}</dc:creator>
  <cp:lastModifiedBy>Ansiversa Resume Builder</cp:lastModifiedBy>
</cp:coreProperties>`;

const buildAppPropsXml = (): string => `<?xml version="1.0" encoding="UTF-8"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Ansiversa Resume Builder</Application>
</Properties>`;

export async function renderResumeToDocx(document: ResumeDocument): Promise<ArrayBuffer> {
  const files: ZipFile[] = [
    { name: '[Content_Types].xml', content: toUint8Array(buildContentTypesXml()) },
    { name: '_rels/.rels', content: toUint8Array(buildRelsXml()) },
    { name: 'docProps/core.xml', content: toUint8Array(buildCorePropsXml(document)) },
    { name: 'docProps/app.xml', content: toUint8Array(buildAppPropsXml()) },
    { name: 'word/document.xml', content: toUint8Array(buildDocumentXml(document)) },
    { name: 'word/numbering.xml', content: toUint8Array(buildNumberingXml()) },
    { name: 'word/_rels/document.xml.rels', content: toUint8Array(buildDocumentRelsXml()) },
  ];

  const zipped = createZip(files);
  return zipped.buffer.slice(zipped.byteOffset, zipped.byteOffset + zipped.byteLength);
}
