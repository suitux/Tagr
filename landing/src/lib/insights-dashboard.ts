import {
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ChartDataset,
  type Plugin,
} from 'chart.js';
import type { en } from '../i18n/en';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

type Labels = (typeof en)['insights'];
type Range = '30d' | '90d' | '1y' | 'all';
type ChartId = 'instances' | 'versions' | 'platforms' | 'librarySizes' | 'features' | 'activity' | 'formats';

/** Mirrors DailySummary in tagr-insights (src/summarize.ts). */
interface DailySummary {
  instances: number;
  versions: Record<string, number>;
  platforms: Record<string, number>;
  containerized: { docker: number; bare: number };
  librarySizes: Record<string, number>;
  fileExtensions: Record<string, number>;
  features: Record<string, number>;
  totals: { songs: number; users: number; metadataEdits7d: number; listens7d: number };
}

interface SummaryResponse {
  range: Range;
  granularity: 'day' | 'week';
  /** When the live point was computed (ISO timestamp) */
  updatedAt: string | null;
  totalInstances: number;
  history: { day: string; summary: DailySummary }[];
}

interface Series {
  label: string;
  values: number[];
  color: string;
}

interface ChartSpec {
  kind: 'line' | 'stacked' | 'stacked-percent';
  series: Series[];
  percentAxis?: boolean;
}

// Dark categorical palette, validated against the card surface (#171717): every adjacent pair
// clears CVD ΔE 8 and normal-vision ΔE 15, every slot clears 3:1. Assigned in this fixed order.
const CATEGORICAL = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300'];
// "Other" is not an entity, so it gets a neutral gray instead of a seventh hue.
const OTHER = '#6e6e6e';
// Library sizes are ordered buckets: one hue, dark → light (validated with --ordinal).
const ORDINAL = ['#184f95', '#256abf', '#3987e5', '#6da7ec', '#9ec5f4', '#cde2fb'];

const SURFACE = '#171717';
const GRID = 'rgba(255, 255, 255, 0.08)';
const MUTED = '#a1a1a1';
const FOREGROUND = '#fafafa';

const LIBRARY_BINS = ['0', '1-1k', '1k-10k', '10k-50k', '50k-100k', '100k+'];
const FEATURE_KEYS = ['metadataEditing', 'smartPlaylists', 'savedFilters', 'multiUser', 'scrobbling', 'sharedLinks'] as const;
const TOP_N = 5;

/** Vertical hairline at the hovered X, so the reader aims at a date rather than a 2px line. */
const crosshair: Plugin<'line'> = {
  id: 'crosshair',
  afterDatasetsDraw(chart) {
    const active = chart.tooltip?.getActiveElements();
    if (!active?.length) return;
    const { ctx, chartArea } = chart;
    const x = active[0].element.x;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.stroke();
    ctx.restore();
  },
};

function compareVersions(a: string, b: string): number {
  const [aMajor, aMinor] = a.split('.').map(Number);
  const [bMajor, bMinor] = b.split('.').map(Number);
  return aMajor - bMajor || aMinor - bMinor;
}

/**
 * Keeps the TOP_N keys by their latest value and folds the rest into "Other". `order` decides
 * the slot each kept key gets, so a key keeps its color for as long as it stays in the view.
 */
function topSeries(
  maps: Record<string, number>[],
  otherLabel: string,
  order: (a: string, b: string) => number = (a, b) => a.localeCompare(b),
): Series[] {
  const latest = maps.at(-1) ?? {};
  const keys = new Set(maps.flatMap((map) => Object.keys(map)));
  const ranked = [...keys].sort((a, b) => (latest[b] ?? 0) - (latest[a] ?? 0));
  const kept = ranked.slice(0, TOP_N).sort(order);
  const folded = ranked.slice(TOP_N);

  const series: Series[] = kept.map((key, index) => ({
    label: key,
    values: maps.map((map) => map[key] ?? 0),
    color: CATEGORICAL[index],
  }));

  if (folded.length > 0) {
    series.push({
      label: otherLabel,
      values: maps.map((map) => folded.reduce((sum, key) => sum + (map[key] ?? 0), 0)),
      color: OTHER,
    });
  }
  return series;
}

function toPercent(series: Series[]): Series[] {
  const totals = series[0]?.values.map((_, index) => series.reduce((sum, item) => sum + item.values[index], 0)) ?? [];
  return series.map((item) => ({
    ...item,
    values: item.values.map((value, index) => (totals[index] ? (value / totals[index]) * 100 : 0)),
  }));
}

function buildSpecs(history: SummaryResponse['history'], labels: Labels): Record<ChartId, ChartSpec> {
  const summaries = history.map((point) => point.summary);
  const instances = summaries.map((summary) => summary.instances);

  return {
    instances: {
      kind: 'line',
      series: [{ label: labels.charts.instances.title, values: instances, color: CATEGORICAL[0] }],
    },
    versions: {
      kind: 'stacked',
      series: topSeries(
        summaries.map((summary) => summary.versions),
        labels.other,
        compareVersions,
      ),
    },
    platforms: {
      kind: 'stacked-percent',
      series: toPercent(topSeries(summaries.map((summary) => summary.platforms), labels.other)),
    },
    librarySizes: {
      kind: 'stacked-percent',
      series: toPercent(
        LIBRARY_BINS.map((bin, index) => ({
          label: bin,
          values: summaries.map((summary) => summary.librarySizes[bin] ?? 0),
          color: ORDINAL[index],
        })),
      ),
    },
    features: {
      kind: 'line',
      percentAxis: true,
      series: FEATURE_KEYS.map((key, index) => ({
        label: labels.features[key],
        values: summaries.map((summary) =>
          summary.instances ? ((summary.features[key] ?? 0) / summary.instances) * 100 : 0,
        ),
        color: CATEGORICAL[index],
      })),
    },
    activity: {
      kind: 'line',
      series: (['metadataEdits7d', 'listens7d'] as const).map((key, index) => ({
        label: labels.activity[key],
        values: summaries.map((summary) => summary.totals[key]),
        color: CATEGORICAL[index],
      })),
    },
    formats: {
      kind: 'stacked-percent',
      series: toPercent(topSeries(summaries.map((summary) => summary.fileExtensions), labels.other)),
    },
  };
}

export function initInsightsDashboard(root: HTMLElement): void {
  const api = root.dataset.api!.replace(/\/$/, '');
  const locale = root.dataset.locale ?? 'en';
  const labels = JSON.parse(root.dataset.labels!) as Labels;

  const status = root.querySelector<HTMLElement>('.js-status')!;
  const content = root.querySelector<HTMLElement>('.js-content')!;
  const rangeButtons = [...root.querySelectorAll<HTMLButtonElement>('.js-range')];

  const integer = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const compact = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 });
  const percent = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const signed = new Intl.NumberFormat(locale, { signDisplay: 'exceptZero', maximumFractionDigits: 0 });

  const charts = new Map<ChartId, Chart<'line', number[], string>>();
  let lastSpecs: Record<ChartId, ChartSpec> | null = null;
  let lastDates: string[] = [];
  let lastGranularity: SummaryResponse['granularity'] = 'day';

  function formatDate(day: string, withYear: boolean): string {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: withYear ? 'numeric' : undefined,
      timeZone: 'UTC',
    }).format(new Date(`${day}T00:00:00Z`));
  }

  function formatValue(value: number, spec: ChartSpec): string {
    return spec.kind === 'stacked-percent' || spec.percentAxis ? `${percent.format(value)} %` : integer.format(value);
  }

  function setTile(id: string, value: string, delta = '') {
    root.querySelector(`[data-tile="${id}"]`)!.textContent = value;
    root.querySelector(`[data-tile-delta="${id}"]`)!.textContent = delta;
  }

  function renderTiles(history: SummaryResponse['history']) {
    const first = history[0];
    const latest = history.at(-1);
    if (!latest || !first) {
      for (const id of ['instances', 'songs', 'edits', 'docker']) setTile(id, '–');
      return;
    }

    const since = formatDate(first.day, true);
    const delta = (now: number, then: number, format: (value: number) => string) =>
      history.length > 1 ? labels.vsStart.replace('{delta}', format(now - then)).replace('{date}', since) : '';

    const { summary } = latest;
    setTile(
      'instances',
      integer.format(summary.instances),
      delta(summary.instances, first.summary.instances, (value) => signed.format(value)),
    );
    setTile(
      'songs',
      compact.format(summary.totals.songs),
      delta(summary.totals.songs, first.summary.totals.songs, (value) =>
        value === 0 ? '0' : `${value > 0 ? '+' : '−'}${compact.format(Math.abs(value))}`,
      ),
    );
    setTile('edits', integer.format(summary.totals.metadataEdits7d));

    const { docker, bare } = summary.containerized;
    setTile('docker', docker + bare ? `${percent.format((docker / (docker + bare)) * 100)} %` : '–');
  }

  function datasetsFor(spec: ChartSpec): ChartDataset<'line', number[]>[] {
    const stacked = spec.kind !== 'line';
    return spec.series.map((series, index) => ({
      label: series.label,
      data: series.values,
      borderColor: stacked ? SURFACE : series.color,
      backgroundColor: series.color,
      // Stacked bands are separated by a 2px surface gap, not by a border in another color.
      borderWidth: 2,
      fill: stacked ? (index === 0 ? 'origin' : '-1') : false,
      pointRadius: 0,
      pointHoverRadius: stacked ? 0 : 4,
      pointHoverBorderColor: SURFACE,
      pointHoverBorderWidth: 2,
      // Curved bands overshoot each other where a series drops to zero.
      tension: stacked ? 0 : 0.25,
    }));
  }

  function renderChart(id: ChartId, spec: ChartSpec, dates: string[], granularity: SummaryResponse['granularity']) {
    const withYear = granularity === 'week';
    const chartLabels = dates.map((day) => formatDate(day, withYear));
    const existing = charts.get(id);

    if (existing) {
      existing.data.labels = chartLabels;
      existing.data.datasets = datasetsFor(spec);
      existing.options.scales!.y!.max = spec.kind === 'stacked-percent' ? 100 : undefined;
      existing.update();
      return;
    }

    const canvas = root.querySelector<HTMLCanvasElement>(`[data-chart="${id}"]`)!;
    const stacked = spec.kind !== 'line';
    const isPercent = spec.kind === 'stacked-percent' || spec.percentAxis;

    const chart = new Chart<'line', number[], string>(canvas, {
      type: 'line',
      data: { labels: chartLabels, datasets: datasetsFor(spec) },
      plugins: [crosshair],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            grid: { display: false },
            border: { color: GRID },
            ticks: { color: MUTED, maxRotation: 0, autoSkipPadding: 24, font: { size: 11 } },
          },
          y: {
            stacked,
            beginAtZero: true,
            max: spec.kind === 'stacked-percent' ? 100 : undefined,
            grid: { color: GRID },
            border: { display: false },
            ticks: {
              color: MUTED,
              font: { size: 11 },
              maxTicksLimit: 5,
              callback: (value) => (isPercent ? `${value} %` : compact.format(Number(value))),
            },
          },
        },
        plugins: {
          legend: {
            // A single series is named by the chart title; two or more always get a legend.
            display: spec.series.length > 1,
            position: 'bottom',
            labels: {
              color: MUTED,
              boxWidth: 10,
              boxHeight: 10,
              padding: 14,
              font: { size: 12 },
              usePointStyle: !stacked,
              pointStyle: 'line',
            },
          },
          tooltip: {
            backgroundColor: '#262626',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            borderWidth: 1,
            titleColor: MUTED,
            bodyColor: FOREGROUND,
            padding: 10,
            boxWidth: 10,
            boxHeight: 2,
            usePointStyle: false,
            // Top of the stack first, matching the order the bands are drawn in.
            itemSort: stacked ? (a, b) => b.datasetIndex - a.datasetIndex : undefined,
            callbacks: {
              label: (item) => ` ${formatValue(Number(item.raw), lastSpecs![id])}  ${item.dataset.label}`,
              labelColor: (item) => {
                const color = lastSpecs![id].series[item.datasetIndex]?.color ?? MUTED;
                return { borderColor: color, backgroundColor: color };
              },
            },
          },
        },
      },
    });
    charts.set(id, chart);
  }

  /** Table view: every value reachable without hovering. Built lazily, with textContent only. */
  function renderTable(details: HTMLDetailsElement) {
    const id = details.dataset.table as ChartId;
    const spec = lastSpecs?.[id];
    const container = details.querySelector('div')!;
    container.replaceChildren();
    if (!spec || !details.open) return;

    const table = document.createElement('table');
    table.className = 'w-full text-left text-xs tabular-nums';
    const head = table.createTHead().insertRow();
    for (const text of [lastGranularity === 'week' ? labels.week : labels.date, ...spec.series.map((s) => s.label)]) {
      const th = document.createElement('th');
      th.className = 'sticky top-0 bg-[var(--card)] py-1.5 pr-4 font-medium text-[var(--muted-foreground)]';
      th.textContent = text;
      head.appendChild(th);
    }

    const body = table.createTBody();
    // Newest first: the row people look for is the latest one.
    for (let index = lastDates.length - 1; index >= 0; index--) {
      const row = body.insertRow();
      row.className = 'border-t border-[var(--border)]';
      const dateCell = row.insertCell();
      dateCell.className = 'py-1.5 pr-4 text-[var(--muted-foreground)]';
      dateCell.textContent = formatDate(lastDates[index], true);
      for (const series of spec.series) {
        const cell = row.insertCell();
        cell.className = 'py-1.5 pr-4';
        cell.textContent = formatValue(series.values[index], spec);
      }
    }
    container.appendChild(table);
  }

  const tables = [...root.querySelectorAll<HTMLDetailsElement>('.js-table')];
  for (const details of tables) {
    details.addEventListener('toggle', () => renderTable(details));
  }

  async function load(range: Range) {
    for (const button of rangeButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.range === range));
    }
    // Refetch keeps the frame: the previous render stays, dimmed, until the new data lands.
    content.style.opacity = '0.5';

    try {
      const response = await fetch(`${api}/summary.json?range=${range}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as SummaryResponse;

      if (data.history.length === 0) {
        status.textContent = labels.empty;
        renderTiles([]);
        return;
      }

      status.textContent = data.updatedAt
        ? labels.updated.replace(
            '{date}',
            new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data.updatedAt)),
          )
        : '';

      lastSpecs = buildSpecs(data.history, labels);
      lastDates = data.history.map((point) => point.day);
      lastGranularity = data.granularity;

      renderTiles(data.history);
      for (const [id, spec] of Object.entries(lastSpecs) as [ChartId, ChartSpec][]) {
        renderChart(id, spec, lastDates, data.granularity);
      }
      for (const details of tables) renderTable(details);
    } catch (error) {
      console.error('Could not load Tagr Insights:', error);
      status.textContent = labels.error;
    } finally {
      content.style.opacity = '';
    }
  }

  const initial = new URLSearchParams(location.search).get('range');
  const startRange: Range = initial === '30d' || initial === '1y' || initial === 'all' ? initial : '90d';

  for (const button of rangeButtons) {
    button.addEventListener('click', () => {
      const range = button.dataset.range as Range;
      const url = new URL(location.href);
      url.searchParams.set('range', range);
      history.replaceState(null, '', url);
      void load(range);
    });
  }

  void load(startRange);
}
