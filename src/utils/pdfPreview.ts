import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker using unpkg CDN or bundled worker URL
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Could not set pdf.workerSrc', e);
  }
}

/**
 * Render a specific page of a PDF file to a canvas and return data URL.
 */
export async function renderPdfPageThumbnail(
  fileOrBuffer: File | ArrayBuffer,
  pageNumber = 1,
  maxWidth = 420
): Promise<{ dataUrl: string; numPages: number; width: number; height: number }> {
  try {
    const arrayBuffer =
      fileOrBuffer instanceof File ? await fileOrBuffer.arrayBuffer() : fileOrBuffer;

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const targetPageNum = Math.max(1, Math.min(pageNumber, numPages));
    const page = await pdfDoc.getPage(targetPageNum);

    const initialViewport = page.getViewport({ scale: 1 });
    const scale = maxWidth / initialViewport.width;
    const viewport = page.getViewport({ scale: Math.min(scale, 2.5) });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (!context) {
      throw new Error('Canvas 2D context not available');
    }

    // Render white background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await (page.render as any)({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    const dataUrl = canvas.toDataURL('image/png', 0.92);
    return {
      dataUrl,
      numPages,
      width: viewport.width,
      height: viewport.height,
    };
  } catch (error) {
    console.warn('PDF.js rendering fallback triggered:', error);
    return createMockDocumentThumbnail(fileOrBuffer, pageNumber);
  }
}

/**
 * Render first page of a PDF file directly onto a provided HTMLCanvasElement
 */
export async function renderPdfFirstPageToCanvas(
  fileOrBuffer: File | ArrayBuffer,
  canvas: HTMLCanvasElement,
  maxWidth = 480
): Promise<{ numPages: number; width: number; height: number; success: boolean }> {
  try {
    const arrayBuffer =
      fileOrBuffer instanceof File ? await fileOrBuffer.arrayBuffer() : fileOrBuffer;

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const page = await pdfDoc.getPage(1);

    const initialViewport = page.getViewport({ scale: 1 });
    const scale = maxWidth / initialViewport.width;
    const viewport = page.getViewport({ scale: Math.max(scale, 0.4) });

    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context not available');
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await (page.render as any)({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    return {
      numPages,
      width: Math.round(initialViewport.width),
      height: Math.round(initialViewport.height),
      success: true,
    };
  } catch (error) {
    console.warn('Direct canvas render fallback triggered:', error);
    drawFallbackPageToCanvas(fileOrBuffer, canvas, 1);
    return {
      numPages: 1,
      width: 400,
      height: 560,
      success: false,
    };
  }
}

/**
 * Fallback generator that paints directly to a DOM canvas
 */
export function drawFallbackPageToCanvas(
  fileOrBuffer: File | ArrayBuffer,
  canvas: HTMLCanvasElement,
  pageNumber = 1
): void {
  canvas.width = 400;
  canvas.height = 560; // Standard 1:1.414 A4 ratio
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const fileName = fileOrBuffer instanceof File ? fileOrBuffer.name : 'Document.pdf';
  const fileSizeKb =
    fileOrBuffer instanceof File
      ? Math.round(fileOrBuffer.size / 1024)
      : Math.round(fileOrBuffer.byteLength / 1024);

  // Elegant off-white paper canvas
  ctx.fillStyle = '#f8f8f5';
  ctx.fillRect(0, 0, 400, 560);

  // Decorative top neon orange banner
  ctx.fillStyle = '#ff5722';
  ctx.fillRect(0, 0, 400, 8);

  // Header metadata
  ctx.fillStyle = '#ff5722';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('MAKEPDF CANVAS INSPECTOR', 30, 40);

  ctx.fillStyle = '#64748b';
  ctx.font = '11px monospace';
  ctx.fillText(`PAGE ${pageNumber.toString().padStart(2, '0')}`, 310, 40);

  // Document Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px sans-serif';
  const displayTitle = fileName.length > 24 ? fileName.substring(0, 21) + '...' : fileName;
  ctx.fillText(displayTitle, 30, 80);

  // Divider line
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(30, 95);
  ctx.lineTo(370, 95);
  ctx.stroke();

  // Simulated content lines with realistic paragraphs
  ctx.fillStyle = '#cbd5e1';
  for (let y = 125; y < 440; y += 22) {
    const lineLen = y % 66 === 0 ? 250 : y % 44 === 0 ? 300 : 340;
    ctx.fillRect(30, y, lineLen, 8);
  }

  // Watermark/Footer stamp
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(30, 480, 340, 40);
  ctx.fillStyle = '#475569';
  ctx.font = '11px monospace';
  ctx.fillText(`SIZE: ${fileSizeKb} KB  ·  CANVAS THUMBNAIL`, 45, 505);
}

/**
 * Fallback generator in case worker is blocked by sandboxed iframe CSP
 */
async function createMockDocumentThumbnail(
  fileOrBuffer: File | ArrayBuffer,
  pageNumber = 1
): Promise<{ dataUrl: string; numPages: number; width: number; height: number }> {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 560; // Standard 1:1.414 A4 ratio
  const ctx = canvas.getContext('2d');

  const fileName = fileOrBuffer instanceof File ? fileOrBuffer.name : 'Document.pdf';
  const fileSizeKb =
    fileOrBuffer instanceof File
      ? Math.round(fileOrBuffer.size / 1024)
      : Math.round(fileOrBuffer.byteLength / 1024);

  if (ctx) {
    // Elegant off-white paper canvas
    ctx.fillStyle = '#f8f8f5';
    ctx.fillRect(0, 0, 400, 560);

    // Decorative top neon orange banner
    ctx.fillStyle = '#ff5722';
    ctx.fillRect(0, 0, 400, 8);

    // Header metadata
    ctx.fillStyle = '#ff5722';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('MAKEPDF PREVIEW', 30, 40);

    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.fillText(`PAGE ${pageNumber.toString().padStart(2, '0')}`, 320, 40);

    // Document Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px sans-serif';
    const displayTitle = fileName.length > 24 ? fileName.substring(0, 21) + '...' : fileName;
    ctx.fillText(displayTitle, 30, 80);

    // Divider line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 95);
    ctx.lineTo(370, 95);
    ctx.stroke();

    // Simulated content lines with realistic paragraphs
    ctx.fillStyle = '#cbd5e1';
    for (let y = 125; y < 440; y += 22) {
      const lineLen = y % 66 === 0 ? 250 : y % 44 === 0 ? 300 : 340;
      ctx.fillRect(30, y, lineLen, 8);
    }

    // Watermark/Footer stamp
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(30, 480, 340, 40);
    ctx.fillStyle = '#475569';
    ctx.font = '11px monospace';
    ctx.fillText(`SIZE: ${fileSizeKb} KB  ·  EPHEMERAL STREAM`, 45, 505);
  }

  return {
    dataUrl: canvas.toDataURL('image/png'),
    numPages: 1,
    width: 400,
    height: 560,
  };
}
