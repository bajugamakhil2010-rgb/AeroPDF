/**
 * Generates authentic, compliant PDF-1.4 binary documents directly in the browser
 * with multiple pages, text styling, tables, shapes, and metrics so PDF.js
 * can render real pages with full fidelity!
 */

interface PdfPageContent {
  title: string;
  subtitle?: string;
  sections: {
    heading: string;
    body: string[];
  }[];
  footer?: string;
}

function escapePdfText(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/**
 * Builds a valid binary PDF-1.4 document ArrayBuffer from structured content.
 */
export function createSamplePdfDocument(docTitle: string, pages: PdfPageContent[]): ArrayBuffer {
  const objects: string[] = [];

  // Helper to add an object and return its 1-based index
  const addObject = (content: string): number => {
    objects.push(content);
    return objects.length;
  };

  // Object 1: Font Helvetica
  const fontObjId = addObject(`<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica
>>`);

  // Object 2: Font Helvetica-Bold
  const fontBoldObjId = addObject(`<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica-Bold
>>`);

  // We will need page object IDs
  const pageObjIds: number[] = [];
  const contentStreamObjIds: number[] = [];

  // Prepare streams for each page
  pages.forEach((pageData, index) => {
    let stream = '';

    // Decorative top header bar
    stream += 'q\n';
    stream += '0.1 0.18 0.36 rg\n'; // Slate navy
    stream += '0 790 595 52 re f\n';
    stream += '0.2 0.45 0.95 rg\n'; // Accent line
    stream += '0 788 595 2 re f\n';
    stream += 'Q\n';

    // Top Brand & Header Text
    stream += 'BT\n';
    stream += `/F2 16 Tf\n`;
    stream += '1 1 1 rg\n'; // White text
    stream += '40 812 Td\n';
    stream += `(${escapePdfText(docTitle)}) Tj\n`;
    stream += 'ET\n';

    // Page indicator top right
    stream += 'BT\n';
    stream += `/F1 10 Tf\n`;
    stream += '0.7 0.8 0.95 rg\n';
    stream += `480 812 Td\n`;
    stream += `(Page ${index + 1} of ${pages.length}) Tj\n`;
    stream += 'ET\n';

    let currentY = 740;

    // Page Title
    stream += 'BT\n';
    stream += `/F2 20 Tf\n`;
    stream += '0.08 0.12 0.2 rg\n'; // Dark navy
    stream += `40 ${currentY} Td\n`;
    stream += `(${escapePdfText(pageData.title)}) Tj\n`;
    stream += 'ET\n';
    currentY -= 24;

    if (pageData.subtitle) {
      stream += 'BT\n';
      stream += `/F1 12 Tf\n`;
      stream += '0.35 0.4 0.5 rg\n';
      stream += `40 ${currentY} Td\n`;
      stream += `(${escapePdfText(pageData.subtitle)}) Tj\n`;
      stream += 'ET\n';
      currentY -= 30;
    }

    // Horizontal divider
    stream += 'q\n';
    stream += '0.85 0.88 0.92 RG\n';
    stream += '1 w\n';
    stream += `40 ${currentY} m 555 ${currentY} l S\n`;
    stream += 'Q\n';
    currentY -= 25;

    // Render sections
    pageData.sections.forEach((sec) => {
      // Heading box
      stream += 'BT\n';
      stream += `/F2 13 Tf\n`;
      stream += '0.1 0.25 0.65 rg\n';
      stream += `40 ${currentY} Td\n`;
      stream += `(${escapePdfText(sec.heading)}) Tj\n`;
      stream += 'ET\n';
      currentY -= 18;

      // Body lines
      sec.body.forEach((line) => {
        stream += 'BT\n';
        stream += `/F1 10.5 Tf\n`;
        stream += '0.2 0.22 0.28 rg\n';
        stream += `40 ${currentY} Td\n`;
        stream += `(${escapePdfText(line)}) Tj\n`;
        stream += 'ET\n';
        currentY -= 15;
      });

      currentY -= 14;
    });

    // Decorative Card / Metric Callout Box on bottom of page
    stream += 'q\n';
    stream += '0.96 0.97 0.99 rg\n';
    stream += '0.85 0.88 0.94 RG\n';
    stream += '1 w\n';
    stream += '40 60 515 50 re B\n';
    stream += 'Q\n';

    stream += 'BT\n';
    stream += `/F2 10 Tf\n`;
    stream += '0.15 0.3 0.7 rg\n';
    stream += '56 90 Td\n';
    stream += '(VERIFIED ENTERPRISE RECORD - CONFIDENTIAL & PROPRIETARY) Tj\n';
    stream += 'ET\n';

    stream += 'BT\n';
    stream += `/F1 9 Tf\n`;
    stream += '0.4 0.45 0.52 rg\n';
    stream += '56 74 Td\n';
    const foot = pageData.footer || 'Generated with AeroPDF Document Suite - Real-Time In-Browser Vector Rendering';
    stream += `(${escapePdfText(foot)}) Tj\n`;
    stream += 'ET\n';

    // Create stream object
    const streamBytes = new TextEncoder().encode(stream);
    const streamObj = `<<
  /Length ${streamBytes.length}
>>
stream
${stream}endstream`;

    const streamId = addObject(streamObj);
    contentStreamObjIds.push(streamId);
  });

  // Pages parent object ID will be next + pages.length
  // Reserve page object slots
  const pagesContainerId = objects.length + pages.length + 1;

  pages.forEach((_, idx) => {
    const pageId = addObject(`<<
  /Type /Page
  /Parent ${pagesContainerId} 0 R
  /MediaBox [0 0 595 842]
  /Contents ${contentStreamObjIds[idx]} 0 R
  /Resources <<
    /Font <<
      /F1 ${fontObjId} 0 R
      /F2 ${fontBoldObjId} 0 R
    >>
  >>
>>`);
    pageObjIds.push(pageId);
  });

  // Pages Container Object
  addObject(`<<
  /Type /Pages
  /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}]
  /Count ${pages.length}
>>`);

  // Catalog Object
  const catalogId = addObject(`<<
  /Type /Catalog
  /Pages ${pagesContainerId} 0 R
>>`);

  // Build PDF file string
  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets: number[] = [0]; // offset 0 is dummy

  objects.forEach((obj, idx) => {
    const offset = new TextEncoder().encode(pdf).length;
    offsets.push(offset);
    pdf += `${idx + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const startXref = new TextEncoder().encode(pdf).length;
  pdf += 'xref\n';
  pdf += `0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let i = 1; i <= objects.length; i++) {
    const offStr = String(offsets[i]).padStart(10, '0');
    pdf += `${offStr} 00000 n \n`;
  }

  pdf += 'trailer\n';
  pdf += `<<
  /Size ${objects.length + 1}
  /Root ${catalogId} 0 R
>>\n`;
  pdf += 'startxref\n';
  pdf += `${startXref}\n`;
  pdf += '%%EOF\n';

  return new TextEncoder().encode(pdf).buffer as ArrayBuffer;
}

export function generateSampleDocuments(): {
  name: string;
  category: 'work' | 'downloads' | 'personal';
  pages: PdfPageContent[];
}[] {
  return [
    {
      name: 'Q4 Enterprise Performance & Growth Report.pdf',
      category: 'work',
      pages: [
        {
          title: 'Executive Summary & Operating Metrics',
          subtitle: 'Fiscal Quarter Review - Strategic Operations & Financial Milestones',
          sections: [
            {
              heading: '1. Revenue Performance & Operating Margin',
              body: [
                'In Q4, recurring enterprise revenue expanded by 34.2% year-over-year to $48.6M.',
                'Gross margin reached 78.4%, driven by cloud infrastructure optimizations and automation.',
                'Customer retention index stabilized at 99.1% with average expansion of 18% per cohort.',
                'International market adoption accounted for 27% of new ARR additions across EMEA and APAC.',
              ],
            },
            {
              heading: '2. Product Architecture & Cloud Platform Expansion',
              body: [
                'Successfully deployed localized distributed storage regions with zero-downtime cutover.',
                'Sub-second search indexing rolled out across high-volume enterprise document repositories.',
                'Completed SOC2 Type II audit renewal and ISO 27001 certification compliance.',
              ],
            },
          ],
          footer: 'AeroPDF Enterprise Analytics Group - Document ID: AER-2026-Q4-EPR',
        },
        {
          title: 'Market Segments & Customer Health Analysis',
          subtitle: 'Segment Breakdown, Expansion Dynamics, and Churn Prevention',
          sections: [
            {
              heading: '3. Enterprise Cohort Trajectory',
              body: [
                'Mid-market customer segment posted highest velocity with sales cycles compressing by 14 days.',
                'Top tier financial services and healthcare verticals exhibited zero churn across 12 quarters.',
                'Self-serve SaaS conversion rate improved from 3.8% to 6.2% following mobile onboarding redesign.',
              ],
            },
            {
              heading: '4. Capital Allocation & Strategic Targets',
              body: [
                'Allocated 42% of free cash flow toward AI document workflow and parsing engine improvements.',
                'Maintained liquidity reserve of $120M in short-term treasury assets.',
                'Forecasted Q1 guidance projects consolidated revenue between $52.0M and $54.5M.',
              ],
            },
          ],
          footer: 'Audited and Approved by Executive Committee - Confidential Record',
        },
        {
          title: 'Infrastructure Scale & Security Roadmap',
          subtitle: 'Zero-Trust Architecture, Key Rotation, and Global Latency Benchmarks',
          sections: [
            {
              heading: '5. Encryption & Data Sovereignty Standards',
              body: [
                'All document payloads are encrypted in-transit with TLS 1.3 and at-rest using AES-256 GCM.',
                'User device vaults operate client-side keys ensuring zero-knowledge document confidentiality.',
                'Automated failover replication operates under strict recovery point objective (RPO) of < 1 second.',
              ],
            },
            {
              heading: '6. Performance Benchmarks across Mobile & Desktop',
              body: [
                'Canvas render speed for 100-page complex PDF files averages 42 milliseconds on mobile devices.',
                'Pinch-to-zoom hardware acceleration operates at steady 60 fps without layout thrashing.',
              ],
            },
          ],
          footer: 'AeroPDF Security & Infrastructure Council - Revision 4.2',
        },
      ],
    },
    {
      name: 'Mobile App Architecture & Design Spec.pdf',
      category: 'work',
      pages: [
        {
          title: 'Mobile Architecture & Design System',
          subtitle: 'Touch Ergonomics, Safe Areas, and Viewport Guidelines',
          sections: [
            {
              heading: '1. Core Thumb-Zone Design Principles',
              body: [
                'The mobile navigation framework adheres to strict one-handed thumb ergonomics.',
                'Primary action buttons and navigation tabs are positioned within the lower 40% reach zone.',
                'Every interactive hitbox guarantees a minimum surface area of 44 x 44 physical pixels.',
                'Secondary metadata avoids pill capsules, adopting clean typographic separators (middot).',
              ],
            },
            {
              heading: '2. Offline-First IndexedDB Persistence',
              body: [
                'All documents, page thumbnails, and user annotations are persisted locally in IndexedDB.',
                'Users can open, bookmark, and review documents without active network connectivity.',
                'Background workers synchronize state opportunistically once connection is restored.',
              ],
            },
          ],
          footer: 'Design System Engineering Guidelines - Version 3.10',
        },
        {
          title: 'Typography, Contrast & Reader Modes',
          subtitle: 'High-Legibility Font Pairing and AMOLED Dark Palette',
          sections: [
            {
              heading: '3. Reading Modes & Visual Accessibility',
              body: [
                'Standard Mode: Neutral crisp paper background (pure white #ffffff) with slate slate-900 typography.',
                'Night Dark Mode: Inverted low-glare canvas (#0f172a) with high contrast text for night reading.',
                'Warm Sepia Mode: Calming warm filter (#fef3c7 / #fbf0d9) reducing blue-light exposure.',
              ],
            },
            {
              heading: '4. Annotation Engine & Canvas Rendering',
              body: [
                'Real-time vector stroke capture with responsive touch and stylus pressure smoothing.',
                'Highlighter tool applies 40% opacity multiply blending mode for maximum legibility.',
                'Text sticky notes are pinned to normalized (0..1) page coordinates for resolution independence.',
              ],
            },
          ],
          footer: 'AeroPDF Frontend Architecture Specs - Approved 2026',
        },
      ],
    },
    {
      name: 'Quick Reference & User Guide.pdf',
      category: 'downloads',
      pages: [
        {
          title: 'AeroPDF Quick Reference & Gestures',
          subtitle: 'Touch Gestures, Shortcuts, and Document Management Cheatsheet',
          sections: [
            {
              heading: '1. Reading Gestures & Navigation',
              body: [
                'Single Tap: Toggle distraction-free mode (hide top & bottom navigation bars).',
                'Double Tap: Zoom into column / reset zoom to default width.',
                'Pinch Gesture: Fluid zoom from 50% up to 400% scale.',
                'Swipe Left / Right: Jump to next or previous document page.',
                'Page Grid Drawer: Tap the grid icon in top bar to reveal visual thumbnail navigation.',
              ],
            },
            {
              heading: '2. Bookmarks & Annotations',
              body: [
                'Bookmark Page: Tap the bookmark ribbon at the top right to save favorite pages.',
                'Pen & Highlighter: Tap the pen tool to draw notes directly on the document.',
                'Search: Tap the magnifying glass to search keywords across all document pages.',
              ],
            },
          ],
          footer: 'AeroPDF User Essentials - Distributed with Version 2026.1',
        },
        {
          title: 'Cloud Sync, Privacy & Permissions',
          subtitle: 'Transparent Storage Management & Zero-Tracking Security',
          sections: [
            {
              heading: '3. Privacy & Device Permissions',
              body: [
                'Native Picker Only: AeroPDF only accesses files that you explicitly choose to open.',
                'No Hidden Scanning: We never scan your private photos, contacts, or personal folders.',
                'Data Sovereignty: You can clear all local storage or export full backups anytime in Settings.',
              ],
            },
            {
              heading: '4. Cloud Vault & Cross-Device Sync',
              body: [
                'Optional cloud accounts synchronize reading progress and bookmarks across iOS and Android.',
                'Free plan includes 500 MB cloud vault, while Pro tier provides 25 GB with priority sync.',
              ],
            },
          ],
          footer: 'AeroPDF Privacy Charter & Trust Documentation',
        },
      ],
    },
  ];
}
