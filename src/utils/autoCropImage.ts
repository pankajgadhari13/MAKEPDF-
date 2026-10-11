/**
 * Smart Auto-Crop & Document Edge Detection for Uploaded JPGs / Images
 * 
 * Automatically detects document, receipt, paper, or main subject boundaries
 * in user-snapped photos, removing surrounding desks, bedsheets, shadows, and margins.
 */

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AutoCropResult {
  originalFile: File;
  croppedFile: File;
  originalPreviewUrl: string;
  croppedPreviewUrl: string;
  originalWidth: number;
  originalHeight: number;
  croppedWidth: number;
  croppedHeight: number;
  cropRect: CropRect;
  wasCropped: boolean;
  percentSaved: number; // e.g. 25 (%) background removed
}

/**
 * Loads an image file into an HTMLImageElement
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Calculates luminance for an RGB triple
 */
function getLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Detects the document or main object bounding box within an image.
 * Uses background sampling, color distance, and gradient edge detection.
 */
function detectContentBoundingBox(
  img: HTMLImageElement,
  mode: 'balanced' | 'tight' = 'balanced'
): CropRect {
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  if (origW < 10 || origH < 10) {
    return { x: 0, y: 0, width: origW, height: origH };
  }

  // Downscale to a work canvas for fast millisecond edge analysis
  const maxDim = 400;
  const scale = Math.min(1, maxDim / Math.max(origW, origH));
  const workW = Math.max(10, Math.round(origW * scale));
  const workH = Math.max(10, Math.round(origH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = workW;
  canvas.height = workH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { x: 0, y: 0, width: origW, height: origH };
  }

  ctx.drawImage(img, 0, 0, workW, workH);
  const imgData = ctx.getImageData(0, 0, workW, workH);
  const data = imgData.data;

  // 1. Sample outer border perimeter (outer 4% of each side) to estimate background color
  const samplePixels: [number, number, number][] = [];
  const borderW = Math.max(2, Math.floor(workW * 0.04));
  const borderH = Math.max(2, Math.floor(workH * 0.04));

  for (let y = 0; y < workH; y++) {
    for (let x = 0; x < workW; x++) {
      if (x < borderW || x >= workW - borderW || y < borderH || y >= workH - borderH) {
        const idx = (y * workW + x) * 4;
        samplePixels.push([data[idx], data[idx + 1], data[idx + 2]]);
      }
    }
  }

  // Calculate average background RGB and luminance
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  for (const [r, g, b] of samplePixels) {
    sumR += r;
    sumG += g;
    sumB += b;
  }
  const count = samplePixels.length || 1;
  const bgR = sumR / count;
  const bgG = sumG / count;
  const bgB = sumB / count;
  const bgLum = getLuminance(bgR, bgG, bgB);

  // Thresholds based on sensitivity mode
  const colorDiffThreshold = mode === 'tight' ? 18 : 26;
  const lumDiffThreshold = mode === 'tight' ? 16 : 24;
  const edgeGradientThreshold = mode === 'tight' ? 22 : 30;

  // 2. Mark content pixels
  // A pixel is content if color distance to background > threshold OR high gradient
  const isContent = new Uint8Array(workW * workH);

  for (let y = 1; y < workH - 1; y++) {
    for (let x = 1; x < workW - 1; x++) {
      const idx = (y * workW + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = getLuminance(r, g, b);

      // Color distance from background
      const colorDist = Math.sqrt(
        (r - bgR) * (r - bgR) +
        (g - bgG) * (g - bgG) +
        (b - bgB) * (b - bgB)
      );
      const lumDist = Math.abs(lum - bgLum);

      // Gradient magnitude with neighbors
      const lumRight = getLuminance(data[idx + 4], data[idx + 5], data[idx + 6]);
      const lumDown = getLuminance(
        data[idx + workW * 4],
        data[idx + workW * 4 + 1],
        data[idx + workW * 4 + 2]
      );
      const grad = Math.abs(lumRight - lum) + Math.abs(lumDown - lum);

      if (
        colorDist > colorDiffThreshold ||
        lumDist > lumDiffThreshold ||
        grad > edgeGradientThreshold
      ) {
        isContent[y * workW + x] = 1;
      }
    }
  }

  // 3. Project content along rows (Y) and columns (X)
  const rowCounts = new Int32Array(workH);
  const colCounts = new Int32Array(workW);

  for (let y = 0; y < workH; y++) {
    for (let x = 0; x < workW; x++) {
      if (isContent[y * workW + x]) {
        rowCounts[y]++;
        colCounts[x]++;
      }
    }
  }

  // Required density: ignore isolated noise pixels (at least 2.5% of row/col must be content)
  const minRowDensity = Math.max(2, Math.floor(workW * 0.025));
  const minColDensity = Math.max(2, Math.floor(workH * 0.025));

  // Find min/max bounds
  let minY = 0;
  while (minY < workH - 1 && rowCounts[minY] < minRowDensity) {
    minY++;
  }

  let maxY = workH - 1;
  while (maxY > minY && rowCounts[maxY] < minRowDensity) {
    maxY--;
  }

  let minX = 0;
  while (minX < workW - 1 && colCounts[minX] < minColDensity) {
    minX++;
  }

  let maxX = workW - 1;
  while (maxX > minX && colCounts[maxX] < minColDensity) {
    maxX--;
  }

  // Calculate box in original image coordinates
  const scaleBack = 1 / scale;
  let origMinX = Math.floor(minX * scaleBack);
  let origMaxX = Math.ceil((maxX + 1) * scaleBack);
  let origMinY = Math.floor(minY * scaleBack);
  let origMaxY = Math.ceil((maxY + 1) * scaleBack);

  // Add 1.5% safety padding so document text/edges aren't uncomfortably clipped
  const padX = Math.round(origW * 0.015);
  const padY = Math.round(origH * 0.015);

  origMinX = Math.max(0, origMinX - padX);
  origMinY = Math.max(0, origMinY - padY);
  origMaxX = Math.min(origW, origMaxX + padX);
  origMaxY = Math.min(origH, origMaxY + padY);

  const cropW = Math.max(1, origMaxX - origMinX);
  const cropH = Math.max(1, origMaxY - origMinY);

  const croppedArea = cropW * cropH;
  const totalArea = origW * origH;
  const coverageRatio = croppedArea / totalArea;

  // Validation:
  // If the detected content area is between 15% and 97% of the total frame,
  // we have successfully identified an object/document sitting on a background!
  if (coverageRatio >= 0.15 && coverageRatio <= 0.97) {
    return {
      x: origMinX,
      y: origMinY,
      width: cropW,
      height: cropH,
    };
  }

  // If already > 97%, slight border cleanup or full
  return {
    x: 0,
    y: 0,
    width: origW,
    height: origH,
  };
}

/**
 * Automatically detects document/photo bounds, crops the image in high fidelity,
 * and returns both cropped and original assets with preview URLs.
 */
export async function autoCropImage(
  file: File,
  mode: 'balanced' | 'tight' = 'balanced'
): Promise<AutoCropResult> {
  const originalPreviewUrl = URL.createObjectURL(file);
  const img = await loadImageFromFile(file);

  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  const cropRect = detectContentBoundingBox(img, mode);

  const wasCropped =
    cropRect.width < origW * 0.98 ||
    cropRect.height < origH * 0.98 ||
    cropRect.x > origW * 0.02 ||
    cropRect.y > origH * 0.02;

  // Render cropped region to a high-resolution canvas
  const canvas = document.createElement('canvas');
  canvas.width = cropRect.width;
  canvas.height = cropRect.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not create canvas context');
  }

  ctx.drawImage(
    img,
    cropRect.x,
    cropRect.y,
    cropRect.width,
    cropRect.height,
    0,
    0,
    cropRect.width,
    cropRect.height
  );

  // Convert to high-quality JPEG blob
  const croppedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob conversion failed'));
      },
      'image/jpeg',
      0.95
    );
  });

  const croppedPreviewUrl = URL.createObjectURL(croppedBlob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const ext = file.type === 'image/png' ? 'png' : 'jpg';
  const croppedFile = new File(
    [croppedBlob],
    wasCropped ? `${baseName}_autocropped.${ext}` : file.name,
    { type: 'image/jpeg' }
  );

  const originalArea = origW * origH;
  const croppedArea = cropRect.width * cropRect.height;
  const percentSaved = wasCropped
    ? Math.max(1, Math.round(((originalArea - croppedArea) / originalArea) * 100))
    : 0;

  return {
    originalFile: file,
    croppedFile,
    originalPreviewUrl,
    croppedPreviewUrl,
    originalWidth: origW,
    originalHeight: origH,
    croppedWidth: cropRect.width,
    croppedHeight: cropRect.height,
    cropRect,
    wasCropped,
    percentSaved,
  };
}
