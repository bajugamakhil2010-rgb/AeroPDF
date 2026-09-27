import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker securely with CDN fallback matching the installed version
if (typeof window !== 'undefined') {
  try {
    // Attempt local worker URL or unpkg/cdnjs worker
    const workerVersion = pdfjsLib.version || '4.10.38';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${workerVersion}/pdf.worker.min.mjs`;
  } catch (err) {
    console.warn('Worker initialization warning:', err);
  }
}

export interface SearchMatch {
  pageNumber: number;
  matchIndex: number;
  snippet: string;
}

/**
 * Loads a PDF document from an ArrayBuffer
 */
export async function loadPdf(data: ArrayBuffer): Promise<pdfjsLib.PDFDocumentProxy> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(data),
    cMapUrl: 'https://unpkg.com/pdfjs-dist@legacy/cmaps/',
    cMapPacked: true,
  });
  return await loadingTask.promise;
}

/**
 * Renders a specific page onto an HTMLCanvasElement with device pixel ratio scaling
 */
export async function renderPdfPage(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number = 1.0,
  rotation: number = 0
): Promise<{ width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNumber);
  const totalRotation = (page.rotate + rotation) % 360;
  const viewport = page.getViewport({ scale, rotation: totalRotation });

  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(viewport.width * pixelRatio);
  canvas.height = Math.floor(viewport.height * pixelRatio);
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport,
  };

  // @ts-expect-error RenderParameters type compatibility
  await page.render(renderContext).promise;

  return { width: viewport.width, height: viewport.height };
}

/**
 * Generates a thumbnail preview dataURL of page 1
 */
export async function generateThumbnail(data: ArrayBuffer): Promise<string> {
  try {
    const pdfDoc = await loadPdf(data);
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 0.35 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    // @ts-expect-error RenderParameters type compatibility
    await page.render(renderContext).promise;
    return canvas.toDataURL('image/jpeg', 0.82);
  } catch (err) {
    console.warn('Could not generate thumbnail from PDF:', err);
    return '';
  }
}

/**
 * Searches for text within the entire PDF document
 */
export async function searchPdf(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  searchQuery: string
): Promise<SearchMatch[]> {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return [];

  const results: SearchMatch[] = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageString = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');

      const lowerPage = pageString.toLowerCase();
      let startIndex = 0;
      let matchIdx = 0;

      while ((startIndex = lowerPage.indexOf(query, startIndex)) !== -1) {
        const snippetStart = Math.max(0, startIndex - 25);
        const snippetEnd = Math.min(pageString.length, startIndex + query.length + 35);
        const snippet = (snippetStart > 0 ? '...' : '') +
          pageString.substring(snippetStart, snippetEnd).trim() +
          (snippetEnd < pageString.length ? '...' : '');

        results.push({
          pageNumber: pageNum,
          matchIndex: matchIdx++,
          snippet: snippet,
        });

        startIndex += query.length;
      }
    } catch (e) {
      console.warn(`Error extracting text on page ${pageNum}:`, e);
    }
  }

  return results;
}
