import { Buffer } from 'node:buffer';
import { buildCoverLetterRenderModel } from './helpers';
import type { CoverLetterDocument } from '../schema';

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
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const paragraph = (text: string, options: { bold?: boolean } = {}): string => {
  const runs: string[] = [];
  runs.push('<w:r>');
  if (options.bold) {
    runs.push('<w:rPr><w:b/></w:rPr>');
  }
  runs.push(`<w:t xml:space="preserve">${escapeXml(text)}</w:t>`);
  runs.push('</w:r>');
  return `<w:p>${runs.join('')}</w:p>`;
};

const paragraphWithStyle = (text: string, style: 'Title' | 'Heading1'): string =>
  `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr><w:r><w:t xml:space="preserve">${escapeXml(
    text,
  )}</w:t></w:r></w:p>`;

const buildDocumentXml = (document: CoverLetterDocument): string => {
  const render = buildCoverLetterRenderModel(document);
  const body: string[] = [];

  body.push(paragraphWithStyle(render.title || 'Cover Letter', 'Title'));
  body.push(paragraph(render.recipientLine));
  render.paragraphs.forEach((paragraphText) => {
    body.push(paragraph(paragraphText));
  });
  body.push(paragraph(render.closing));
  render.signature.split('\n').forEach((line) => body.push(paragraph(line)));

  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body.join('\n    ')}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  return xml;
};

const buildContentTypes = (): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`;

const buildRels = (): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const buildCoreProps = (): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">
  <dc:title>Cover Letter</dc:title>
  <dc:creator>Ansiversa</dc:creator>
  <cp:lastModifiedBy>Ansiversa</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">${new Date().toISOString()}</dcterms:created>
</cp:coreProperties>`;

export const renderCoverLetterDocx = (document: CoverLetterDocument): Uint8Array => {
  const files: ZipFile[] = [
    { name: '[Content_Types].xml', content: toUint8Array(buildContentTypes()) },
    { name: '_rels/.rels', content: toUint8Array(buildRels()) },
    { name: 'docProps/core.xml', content: toUint8Array(buildCoreProps()) },
    { name: 'word/document.xml', content: toUint8Array(buildDocumentXml(document)) },
  ];

  return createZip(files);
};
