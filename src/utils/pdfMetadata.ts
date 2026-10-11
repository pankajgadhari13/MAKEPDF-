import { PDFDocument } from 'pdf-lib';

export interface PdfMetadata {
  fileName: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  pageCount: number;
  author: string;
  creator: string;
  producer: string;
  title: string;
  subject: string;
  keywords: string;
  creationDate: Date | null;
  creationDateFormatted: string;
  modificationDate: Date | null;
  modificationDateFormatted: string;
  isEncrypted: boolean;
  encryptionStatusText: string;
  pdfVersion: string;
  firstPageWidth: number;
  firstPageHeight: number;
  pageFormat: string;
  orientation: 'Portrait' | 'Landscape' | 'Square';
  permissions: {
    canPrint: boolean;
    canCopy: boolean;
    canModify: boolean;
  };
  isValidPdf: boolean;
  rawDictionary: Record<string, string>;
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date: Date | null | undefined): string {
  if (!date || isNaN(date.getTime())) return 'Not specified';
  try {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Not specified';
  }
}

function identifyPageFormat(width: number, height: number): { format: string; orientation: 'Portrait' | 'Landscape' | 'Square' } {
  const minDim = Math.min(width, height);
  const maxDim = Math.max(width, height);
  const orientation: 'Portrait' | 'Landscape' | 'Square' =
    Math.abs(width - height) < 2 ? 'Square' : width > height ? 'Landscape' : 'Portrait';

  // Tolerance in points
  const match = (w: number, h: number) => Math.abs(minDim - w) < 15 && Math.abs(maxDim - h) < 15;

  let format = 'Custom';
  if (match(595, 842)) format = 'A4 Standard';
  else if (match(612, 792)) format = 'US Letter';
  else if (match(612, 1008)) format = 'US Legal';
  else if (match(420, 595)) format = 'A5 Booklet';
  else if (match(842, 1191)) format = 'A3 Poster';
  else format = `${Math.round(width)} × ${Math.round(height)} pt`;

  return { format, orientation };
}

/**
 * Extract PDF header version (%PDF-1.x) directly from binary stream
 */
function extractPdfVersion(buffer: ArrayBuffer): string {
  try {
    const bytes = new Uint8Array(buffer.slice(0, 32));
    const headerStr = String.fromCharCode(...bytes);
    const match = headerStr.match(/%PDF-([0-9.]+)/i);
    return match ? `PDF ${match[1]}` : 'PDF 1.7';
  } catch {
    return 'PDF 1.7';
  }
}

/**
 * Check if the binary contains an encryption dictionary (/Encrypt)
 */
function detectEncryptionInStream(buffer: ArrayBuffer): boolean {
  try {
    // Check first 100KB and last 50KB where xref/trailer /Encrypt usually reside
    const len = buffer.byteLength;
    const sampleSize = Math.min(len, 64 * 1024);
    const headBytes = new Uint8Array(buffer.slice(0, sampleSize));
    const headText = String.fromCharCode(...headBytes);
    if (/\/Encrypt\s+[0-9]+\s+[0-9]+\s+R/i.test(headText) || /\/Encrypt\s*<</i.test(headText)) {
      return true;
    }

    if (len > sampleSize) {
      const tailBytes = new Uint8Array(buffer.slice(Math.max(0, len - 32 * 1024)));
      const tailText = String.fromCharCode(...tailBytes);
      if (/\/Encrypt\s+[0-9]+\s+[0-9]+\s+R/i.test(tailText) || /\/Encrypt\s*<</i.test(tailText)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Inspects and parses full PDF metadata and pre-flight attributes
 */
export async function extractPdfMetadata(file: File): Promise<PdfMetadata> {
  const fileName = file.name;
  const fileSizeBytes = file.size;
  const fileSizeFormatted = formatBytes(file.size);
  const rawDict: Record<string, string> = {};

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfVersion = extractPdfVersion(arrayBuffer);
    const hasBinaryEncrypt = detectEncryptionInStream(arrayBuffer);

    let pdfDoc: PDFDocument;
    let isEncrypted = hasBinaryEncrypt;

    try {
      // First try standard load
      pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
      if (pdfDoc.isEncrypted) {
        isEncrypted = true;
      }
    } catch (loadErr: any) {
      const errStr = String(loadErr || '');
      if (errStr.toLowerCase().includes('encrypt')) {
        isEncrypted = true;
      }
      // Retry with ignoreEncryption to salvage available metadata
      pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    }

    const pageCount = pdfDoc.getPageCount();
    const author = (pdfDoc.getAuthor() || '').trim() || 'Not specified';
    const title = (pdfDoc.getTitle() || '').trim() || fileName.replace(/\.pdf$/i, '');
    const subject = (pdfDoc.getSubject() || '').trim() || 'None';
    const keywords = (pdfDoc.getKeywords() || '').trim() || 'None';
    const creator = (pdfDoc.getCreator() || '').trim() || 'Standard PDF Engine';
    const producer = (pdfDoc.getProducer() || '').trim() || 'MAKEPDF Pre-flight Core';

    const creationDate = pdfDoc.getCreationDate() || null;
    const modificationDate = pdfDoc.getModificationDate() || null;

    // Get first page geometry
    let firstPageWidth = 595.28;
    let firstPageHeight = 841.89;
    try {
      if (pageCount > 0) {
        const page = pdfDoc.getPage(0);
        const size = page.getSize();
        firstPageWidth = Math.round(size.width * 100) / 100;
        firstPageHeight = Math.round(size.height * 100) / 100;
      }
    } catch {
      // Fallback
    }

    const { format: pageFormat, orientation } = identifyPageFormat(firstPageWidth, firstPageHeight);

    // Extract raw dictionary keys
    try {
      const infoDict = (pdfDoc as any).getInfoDict?.();
      if (infoDict && typeof infoDict.entries === 'function') {
        const entries = infoDict.entries();
        for (const [key, val] of entries) {
          rawDict[key.toString()] = val ? val.toString() : '';
        }
      }
    } catch {
      // Non-fatal
    }

    if (Object.keys(rawDict).length === 0) {
      if (title) rawDict['/Title'] = title;
      if (author && author !== 'Not specified') rawDict['/Author'] = author;
      if (subject && subject !== 'None') rawDict['/Subject'] = subject;
      if (creator) rawDict['/Creator'] = creator;
      if (producer) rawDict['/Producer'] = producer;
      if (creationDate) rawDict['/CreationDate'] = creationDate.toISOString();
      if (modificationDate) rawDict['/ModDate'] = modificationDate.toISOString();
    }

    const encryptionStatusText = isEncrypted
      ? 'Encrypted (Password / Permissions Protected)'
      : 'Unencrypted (Standard Open Access)';

    return {
      fileName,
      fileSizeBytes,
      fileSizeFormatted,
      pageCount,
      author,
      creator,
      producer,
      title,
      subject,
      keywords,
      creationDate,
      creationDateFormatted: formatDate(creationDate),
      modificationDate,
      modificationDateFormatted: formatDate(modificationDate),
      isEncrypted,
      encryptionStatusText,
      pdfVersion,
      firstPageWidth,
      firstPageHeight,
      pageFormat,
      orientation,
      permissions: {
        canPrint: !isEncrypted,
        canCopy: !isEncrypted,
        canModify: !isEncrypted,
      },
      isValidPdf: true,
      rawDictionary: rawDict,
    };
  } catch (fatalErr: any) {
    console.error('Failed to extract PDF metadata:', fatalErr);
    return {
      fileName,
      fileSizeBytes,
      fileSizeFormatted,
      pageCount: 1,
      author: 'Not specified',
      creator: 'Unknown',
      producer: 'Unknown',
      title: fileName,
      subject: 'None',
      keywords: 'None',
      creationDate: null,
      creationDateFormatted: 'Not specified',
      modificationDate: null,
      modificationDateFormatted: 'Not specified',
      isEncrypted: false,
      encryptionStatusText: 'Unencrypted (Estimated)',
      pdfVersion: 'PDF 1.7',
      firstPageWidth: 595,
      firstPageHeight: 842,
      pageFormat: 'A4 Standard',
      orientation: 'Portrait',
      permissions: {
        canPrint: true,
        canCopy: true,
        canModify: true,
      },
      isValidPdf: false,
      rawDictionary: rawDict,
      error: fatalErr?.message || 'Could not parse complete PDF dictionary structure',
    };
  }
}
