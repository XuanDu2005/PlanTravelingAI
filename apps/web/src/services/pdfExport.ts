import { jsPDF } from 'jspdf';
import type { GeneratedItinerary, Trip } from '@/types';

type Html2CanvasFn = (
  element: HTMLElement,
  options?: Record<string, unknown>,
) => Promise<HTMLCanvasElement>;

let cachedHtml2Canvas: Html2CanvasFn | null = null;

async function loadHtml2Canvas(): Promise<Html2CanvasFn> {
  if (cachedHtml2Canvas) return cachedHtml2Canvas;
  const module = (await import('html2canvas-pro')) as unknown as {
    default: Html2CanvasFn;
  };
  cachedHtml2Canvas = module.default;
  return cachedHtml2Canvas;
}

const A4_WIDTH_PX = 794; // ~210mm at 96dpi
const A4_HEIGHT_PX = 1123; // ~297mm at 96dpi

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDateRange(start: string, end: string): string {
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const fmt = (d: Date) =>
      d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return `${start} – ${end}`;
    }
    return `${fmt(startDate)} – ${fmt(endDate)}`;
  } catch {
    return `${start} – ${end}`;
  }
}

function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

const FALLBACK_COST: Record<string, number> = {
  FOOD: 180000,
  SIGHTSEEING: 150000,
  CULTURE: 150000,
  NATURE: 180000,
  SHOPPING: 300000,
  RELAX: 350000,
  NIGHTLIFE: 250000,
  TRANSPORT: 200000,
};

function activityCostAmount(activity: GeneratedItinerary['days'][number]['activities'][number]): number {
  const raw = activity.estimatedCost?.trim();
  if (raw && /miễn phí|free/i.test(raw)) return 0;
  if (raw) {
    const numeric = raw.match(/\d[\d.,]*/)?.[0]?.replace(/\D/g, '');
    if (numeric) return Number(numeric);
  }
  return FALLBACK_COST[activity.category] ?? FALLBACK_COST.SIGHTSEEING;
}

function activityHtml(
  activity: GeneratedItinerary['days'][number]['activities'][number],
  idx: number,
): string {
  const cost = activity.estimatedCost?.trim() || formatVnd(activityCostAmount(activity));
  const restaurants =
    activity.suggestedPlaces && activity.suggestedPlaces.length > 0
      ? `<div class="restaurants">
              <div class="restaurants-head">
                <span>🍜 Quán nổi tiếng</span>
                <span class="count">${activity.suggestedPlaces.length} lựa chọn</span>
              </div>
              <div class="restaurant-list">
                ${activity.suggestedPlaces
                  .map(
                    (p) => `
                    <div class="restaurant">
                      <div class="restaurant-name">${escapeHtml(p.name)}</div>
                      <div class="restaurant-meta">📍 ${escapeHtml(p.address || '')}</div>
                      ${p.specialty ? `<div class="restaurant-meta">${escapeHtml(p.specialty)}</div>` : ''}
                      ${p.priceRange ? `<div class="restaurant-price">${escapeHtml(p.priceRange)}</div>` : ''}
                    </div>
                  `,
                  )
                  .join('')}
              </div>
            </div>`
      : '';

  return `
    <div class="activity" data-block="activity">
      <div class="activity-timeline">${idx + 1}</div>
      <div class="activity-body">
        <div class="activity-head">
          <div class="activity-time">${escapeHtml(activity.time || '—')}</div>
          <h4 class="activity-title">${escapeHtml(activity.title || 'Hoạt động')}</h4>
        </div>
        ${activity.description ? `<p class="activity-desc">${escapeHtml(activity.description)}</p>` : ''}
        <div class="activity-meta">
          ${activity.location ? `<span class="meta-pill location">📍 ${escapeHtml(activity.location)}</span>` : ''}
          ${activity.transport ? `<span class="meta-pill">🚗 ${escapeHtml(activity.transport)}</span>` : ''}
          <span class="meta-pill cost">💰 ${escapeHtml(cost)}</span>
        </div>
        ${restaurants}
      </div>
    </div>
  `;
}

function dayHtml(day: GeneratedItinerary['days'][number]): string {
  const dayCost = day.activities.reduce((total, a) => total + activityCostAmount(a), 0);
  return `
    <article class="day" data-block="day" data-day="${day.day}">
      <header class="day-head">
        <div class="day-num">${day.day}</div>
        <div class="day-info">
          <h3>Ngày ${day.day}</h3>
          <p>${escapeHtml(day.date || '')}${day.theme ? ` · <span class="theme">${escapeHtml(day.theme)}</span>` : ''}</p>
        </div>
        <div class="day-stats">
          <span class="badge emerald">${formatVnd(dayCost)}</span>
          <span class="badge slate">${day.activities.length} hoạt động</span>
        </div>
      </header>
      <div class="activities">
        ${day.activities.map((a, i) => activityHtml(a, i)).join('')}
      </div>
    </article>
  `;
}

function tipsHtml(tips: string[]): string {
  if (!tips.length) return '';
  return `
    <section class="tips" data-block="tips">
      <h3>💡 Mẹo hữu ích cho chuyến đi</h3>
      <ul>
        ${tips.map((tip) => `<li><span class="bullet"></span><span>${escapeHtml(tip)}</span></li>`).join('')}
      </ul>
    </section>
  `;
}

const PAGE_STYLES = `
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: local('Inter Regular'), local('Inter-Regular'), local('Segoe UI'), local('Helvetica Neue'), local('Arial');
  }
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 600;
    font-display: swap;
    src: local('Inter SemiBold'), local('Inter-SemiBold'), local('Segoe UI Semibold'), local('Segoe UI'), local('Arial');
  }
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: local('Inter Bold'), local('Inter-Bold'), local('Segoe UI Bold'), local('Segoe UI'), local('Arial');
  }

  *, *::before, *::after { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #0f172a;
    font-family: 'Inter', 'Segoe UI', 'Segoe UI Variable', 'Helvetica Neue', Arial, sans-serif;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: geometricPrecision;
  }
  .page {
    width: ${A4_WIDTH_PX}px;
    background: #ffffff;
    padding: 28px 32px;
  }

  .header {
    background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #7c3aed 100%);
    color: #ffffff;
    border-radius: 16px;
    padding: 20px 26px;
    margin-bottom: 14px;
    box-shadow: 0 8px 24px -10px rgba(37, 99, 235, 0.4);
  }
  .header .brand {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    opacity: 0.92;
    margin-bottom: 4px;
    font-weight: 500;
  }
  .header .brand strong {
    font-weight: 700;
    letter-spacing: 0.04em;
    font-size: 13px;
  }
  .header h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.25;
  }
  .header .sub {
    margin-top: 6px;
    font-size: 12.5px;
    opacity: 0.95;
    line-height: 1.5;
    font-weight: 400;
  }
  .header .sub span { margin-right: 12px; }

  .summary {
    background: linear-gradient(135deg, #eff6ff 0%, #eef2ff 60%, #ecfeff 100%);
    border: 1px solid #dbeafe;
    border-radius: 14px;
    padding: 14px 18px;
    margin-bottom: 12px;
  }
  .summary h2 {
    margin: 0 0 4px;
    font-size: 14px;
    color: #1e3a8a;
    font-weight: 700;
  }
  .summary p {
    margin: 0;
    font-size: 12px;
    line-height: 1.55;
    color: #1f2937;
    font-weight: 400;
  }

  .day {
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    background: #ffffff;
    padding: 14px 18px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  }
  .day-head {
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 10px;
    margin-bottom: 12px;
  }
  .day-num {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
    box-shadow: 0 6px 14px -8px rgba(37, 99, 235, 0.55);
  }
  .day-info h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
  }
  .day-info p {
    margin: 3px 0 0;
    font-size: 11.5px;
    color: #64748b;
    font-weight: 400;
  }
  .day-info .theme {
    display: inline-block;
    background: #eff6ff;
    border: 1px solid #dbeafe;
    color: #1d4ed8;
    border-radius: 999px;
    padding: 1px 8px;
    font-size: 10.5px;
    font-weight: 600;
    margin-left: 4px;
  }
  .day-stats { margin-left: auto; display: flex; gap: 6px; }
  .badge {
    font-size: 10.5px;
    font-weight: 600;
    border-radius: 999px;
    padding: 3px 8px;
    border: 1px solid transparent;
  }
  .badge.emerald {
    background: #ecfdf5;
    color: #047857;
    border-color: #a7f3d0;
  }
  .badge.slate {
    background: #f1f5f9;
    color: #475569;
    border-color: #e2e8f0;
  }

  .activities {
    border-left: 2px solid #dbeafe;
    padding-left: 16px;
    margin-left: 6px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .activity {
    position: relative;
    display: flex;
    gap: 10px;
  }
  .activity-timeline {
    position: absolute;
    left: -26px;
    top: 10px;
    width: 20px;
    height: 20px;
    border-radius: 999px;
    background: #ffffff;
    border: 2px solid #2563eb;
    color: #2563eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9.5px;
    font-weight: 700;
  }
  .activity-body {
    flex: 1;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px 14px;
    background: #ffffff;
  }
  .activity-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    flex-wrap: wrap;
  }
  .activity-time {
    background: #eff6ff;
    border: 1px solid #dbeafe;
    color: #1d4ed8;
    border-radius: 7px;
    padding: 2px 8px;
    font-size: 10.5px;
    font-weight: 600;
    white-space: nowrap;
  }
  .activity-title {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    line-height: 1.35;
  }
  .activity-desc {
    margin: 4px 0 8px;
    font-size: 11.5px;
    color: #334155;
    line-height: 1.55;
    font-weight: 400;
  }
  .activity-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 6px;
  }
  .meta-pill {
    font-size: 10.5px;
    font-weight: 500;
    border-radius: 7px;
    padding: 3px 8px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #475569;
  }
  .meta-pill.location {
    background: #eff6ff;
    color: #1d4ed8;
    border-color: #dbeafe;
  }
  .meta-pill.cost {
    background: #ecfdf5;
    color: #047857;
    border-color: #a7f3d0;
  }

  .restaurants {
    margin-top: 8px;
    background: linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%);
    border: 1px solid #fde68a;
    border-radius: 10px;
    padding: 10px 12px;
  }
  .restaurants-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    font-size: 11.5px;
    font-weight: 600;
    color: #92400e;
  }
  .restaurants-head .count {
    background: #ffffff;
    border: 1px solid #fcd34d;
    color: #b45309;
    border-radius: 999px;
    padding: 1px 7px;
    font-size: 10px;
    font-weight: 600;
  }
  .restaurant-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }
  .restaurant {
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid #fde68a;
    border-radius: 8px;
    padding: 6px 8px;
  }
  .restaurant-name {
    font-size: 11px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 2px;
  }
  .restaurant-meta {
    font-size: 10px;
    color: #64748b;
    line-height: 1.4;
    font-weight: 400;
  }
  .restaurant-price {
    margin-top: 3px;
    font-size: 10px;
    font-weight: 600;
    color: #047857;
  }

  .tips {
    margin-top: 12px;
    border: 1px solid #fde68a;
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border-radius: 14px;
    padding: 14px 18px;
  }
  .tips h3 {
    margin: 0 0 8px;
    font-size: 13px;
    font-weight: 700;
    color: #92400e;
  }
  .tips ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .tips li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 11.5px;
    line-height: 1.5;
    color: #1f2937;
    font-weight: 400;
  }
  .tips .bullet {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 999px;
    background: #f59e0b;
    margin-top: 7px;
    flex-shrink: 0;
  }

  .footer {
    margin-top: 14px;
    padding-top: 10px;
    border-top: 1px solid #e2e8f0;
    text-align: center;
    font-size: 10.5px;
    color: #94a3b8;
    font-weight: 400;
  }
`;

/**
 * Build the header HTML (used only on the first page).
 */
function buildHeaderHtml(trip: Trip, content: GeneratedItinerary): string {
  const dateRange = formatDateRange(trip.startDate, trip.endDate);
  const today = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  return `
    <header class="header">
      <div class="brand">
        <strong>✈️ TRAVELMIND</strong>
        <span>Xuất lịch trình · ${escapeHtml(today)}</span>
      </div>
      <h1>${escapeHtml(content.title || trip.destination)}</h1>
      <div class="sub">
        <span>📍 ${escapeHtml(trip.destination)}</span>
        <span>🗓️ ${escapeHtml(dateRange)}</span>
        <span>👥 ${trip.travelers} người</span>
      </div>
    </header>
  `;
}

function buildSummaryHtml(content: GeneratedItinerary): string {
  if (!content.summary) return '';
  return `<section class="summary">
            <h2>📝 Tóm tắt chuyến đi</h2>
            <p>${escapeHtml(content.summary)}</p>
          </section>`;
}

function buildFooterHtml(): string {
  const today = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  return `<div class="footer">TravelMind · AI-powered itinerary · ${escapeHtml(today)}</div>`;
}

function wrapPage(content: string): string {
  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<style>${PAGE_STYLES}</style>
</head>
<body>
  <div class="page" id="pdf-page">${content}</div>
</body>
</html>`;
}

/**
 * Render a measurement page containing all blocks to measure their heights.
 */
function buildMeasureHtml(trip: Trip, content: GeneratedItinerary): string {
  const sortedDays = [...content.days].sort((a, b) => a.day - b.day);
  const blocks: string[] = [
    buildHeaderHtml(trip, content),
    buildSummaryHtml(content),
    ...sortedDays.map(dayHtml),
    tipsHtml(content.tips ?? []),
    buildFooterHtml(),
  ].filter(Boolean);
  return wrapPage(blocks.join(''));
}

/**
 * Split blocks into pages based on measured heights.
 * - Header and summary: only on first page.
 * - Footer: only on last page.
 * - Day/activity/tips blocks are split greedily with no splitting inside a block.
 */
function splitIntoPages(
  host: HTMLElement,
  maxPageHeightPx: number,
): { blocks: HTMLElement[]; hasHeader: boolean; hasFooter: boolean; isLast: boolean }[] {
  const page = host.querySelector('#pdf-page') as HTMLElement | null;
  if (!page) return [];

  const blocks = Array.from(page.children) as HTMLElement[];
  if (!blocks.length) return [];

  // Separate special blocks from content blocks
  let headerBlock: HTMLElement | null = null;
  let summaryBlock: HTMLElement | null = null;
  let footerBlock: HTMLElement | null = null;
  const contentBlocks: HTMLElement[] = [];

  for (const block of blocks) {
    const type = block.dataset.block || '';
    if (type === 'header') headerBlock = block;
    else if (type === 'summary') summaryBlock = block;
    else if (type === 'footer') footerBlock = block;
    else contentBlocks.push(block);
  }

  // Reserve header + summary height on the first page
  const headerHeight = headerBlock ? headerBlock.getBoundingClientRect().height : 0;
  const summaryHeight = summaryBlock ? summaryBlock.getBoundingClientRect().height : 0;

  const pages: { blocks: HTMLElement[]; hasHeader: boolean; hasFooter: boolean; isLast: boolean }[] = [];

  // First pass: pack content blocks into pages
  const contentPages: HTMLElement[][] = [];
  let currentPage: HTMLElement[] = [];
  let currentHeight = 0;

  // Remaining height available on first page after header+summary
  let availableHeight = maxPageHeightPx;
  if (headerBlock) availableHeight -= headerHeight;
  if (summaryBlock) availableHeight -= summaryHeight;

  for (const block of contentBlocks) {
    const blockHeight = block.getBoundingClientRect().height;

    if (currentHeight + blockHeight > availableHeight && currentPage.length > 0) {
      contentPages.push(currentPage);
      currentPage = [];
      currentHeight = 0;
      availableHeight = maxPageHeightPx; // subsequent pages use full height
    }

    currentPage.push(block);
    currentHeight += blockHeight;
  }

  if (currentPage.length > 0) {
    contentPages.push(currentPage);
  }

  // Now build pages with header/footer attachments
  for (let i = 0; i < contentPages.length; i += 1) {
    const isFirst = i === 0;
    const isLast = i === contentPages.length - 1;

    const pageBlocks: HTMLElement[] = [];
    if (isFirst && headerBlock) pageBlocks.push(headerBlock);
    if (isFirst && summaryBlock) pageBlocks.push(summaryBlock);
    pageBlocks.push(...contentPages[i]);
    if (isLast && footerBlock) pageBlocks.push(footerBlock);

    pages.push({
      blocks: pageBlocks,
      hasHeader: isFirst && !!headerBlock,
      hasFooter: isLast && !!footerBlock,
      isLast,
    });
  }

  return pages;
}

function buildPageHtmlFromBlocks(
  blocks: HTMLElement[],
  headerHtml: string,
  showHeader: boolean,
  showFooter: boolean,
): string {
  const parts: string[] = [];
  if (showHeader) parts.push(headerHtml);
  for (const block of blocks) {
    const type = block.dataset.block || '';
    if (type === 'header') continue; // already handled above
    if (type === 'summary' && !showHeader) continue; // only on first page
    if (type === 'footer') {
      if (showFooter) parts.push(block.outerHTML);
      continue;
    }
    parts.push(block.outerHTML);
  }
  return wrapPage(parts.join(''));
}

async function renderToCanvas(host: HTMLElement, html: string): Promise<HTMLCanvasElement> {
  host.innerHTML = html;
  if (document.fonts && typeof document.fonts.ready === 'object') {
    try {
      await document.fonts.ready;
      // Force-load any pending @font-face declarations
      await Promise.all(
        Array.from(document.fonts).map((f) => {
          if (f.status === 'unloaded') return f.load();
          return Promise.resolve();
        }),
      );
      await document.fonts.ready;
    } catch {
      /* ignore font loading failures */
    }
  }
  // Allow browser to commit layout with the loaded fonts
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  const target = host.querySelector('#pdf-page') as HTMLElement | null;
  if (!target) {
    throw new Error('Không tìm thấy nội dung để xuất PDF.');
  }
  const html2canvas = await loadHtml2Canvas();
  return html2canvas(target, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    letterRendering: true,
    allowTaint: true,
    windowWidth: A4_WIDTH_PX,
    windowHeight: target.scrollHeight,
  });
}

export async function exportItineraryPdf(trip: Trip): Promise<void> {
  if (!trip.itinerary?.content) {
    throw new Error('Chuyến đi chưa có lịch trình để xuất.');
  }
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Xuất PDF chỉ hoạt động trong trình duyệt.');
  }

  const content = trip.itinerary.content;
  const headerHtml = buildHeaderHtml(trip, content);

  // Step 1: Render the full content once to measure block heights
  const measureHost = document.createElement('div');
  measureHost.style.position = 'fixed';
  measureHost.style.left = '-99999px';
  measureHost.style.top = '0';
  measureHost.style.width = `${A4_WIDTH_PX}px`;
  measureHost.style.pointerEvents = 'none';
  measureHost.style.opacity = '0';
  document.body.appendChild(measureHost);

  measureHost.innerHTML = buildMeasureHtml(trip, content);

  if (document.fonts && typeof document.fonts.ready === 'object') {
    try {
      await document.fonts.ready;
    } catch {
      /* ignore */
    }
  }
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

  // Step 2: Split blocks into pages based on actual measured heights
  const pageGroups = splitIntoPages(measureHost, A4_HEIGHT_PX);

  document.body.removeChild(measureHost);

  if (!pageGroups.length) {
    throw new Error('Không có nội dung để xuất PDF.');
  }

  // Step 3: Build HTML for each page
  const pageHtmls = pageGroups.map((group) =>
    buildPageHtmlFromBlocks(group.blocks, headerHtml, group.hasHeader, group.hasFooter),
  );

  // Step 4: Render each page to PDF
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-99999px';
  host.style.top = '0';
  host.style.width = `${A4_WIDTH_PX}px`;
  host.style.pointerEvents = 'none';
  host.style.opacity = '0';
  document.body.appendChild(host);

  try {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidthMm = doc.internal.pageSize.getWidth();
    const pageHeightMm = doc.internal.pageSize.getHeight();

    for (let i = 0; i < pageHtmls.length; i += 1) {
      const canvas = await renderToCanvas(host, pageHtmls[i]);
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      if (i > 0) doc.addPage();
      doc.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');
    }

    const safeName = (trip.itinerary.title || trip.destination || 'itinerary')
      .toLowerCase()
      .replace(/[^a-z0-9\u00C0-\u024F\-_]+/gi, '-')
      .replace(/^-+|-+$/g, '');
    const filename = `travelmind-${safeName || 'itinerary'}.pdf`;
    doc.save(filename);
  } finally {
    document.body.removeChild(host);
  }
}