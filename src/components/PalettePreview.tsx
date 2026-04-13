import { useState } from 'react';
import { getContrastColor } from '../lib/colorUtils';
import type { GeneratedPalette } from '../types';

type Tab = 'cards' | 'dashboard' | 'charts' | 'gradients' | 'typography';

const TABS: Tab[] = ['cards', 'dashboard', 'charts', 'gradients', 'typography'];

interface Props {
  palette: GeneratedPalette;
}

function resolveColors(palette: GeneratedPalette) {
  const byRole = (role: string) => palette.colors.find(c => c.role === role);
  const primary   = byRole('primary')    ?? palette.colors[0];
  const secondary = byRole('secondary')  ?? palette.colors[1] ?? palette.colors[0];
  const accent    = byRole('accent')     ?? palette.colors[2] ?? palette.colors[0];
  const bg        = byRole('background') ?? palette.colors[palette.colors.length - 1];
  const neutral   = byRole('neutral')    ?? palette.colors[palette.colors.length - 2] ?? palette.colors[0];
  return { primary, secondary, accent, bg, neutral };
}

// ─── Mini bar chart SVG ───────────────────────────────────────────────────────
function BarChart({ color, accent, values = [45, 72, 58, 89, 63, 91, 77] }: {
  color: string; accent: string; values?: number[];
}) {
  const max = Math.max(...values);
  const w = 28; const gap = 8;
  return (
    <svg viewBox={`0 0 ${values.length * (w + gap) - gap} 64`} className="w-full" style={{ overflow: 'visible' }}>
      {values.map((v, i) => (
        <rect
          key={i}
          x={i * (w + gap)} y={64 - (v / max) * 60}
          width={w} height={(v / max) * 60}
          fill={i === values.length - 2 ? accent : color}
          rx={4} opacity={i === values.length - 2 ? 1 : 0.55}
        />
      ))}
    </svg>
  );
}

// ─── Mini line chart SVG ─────────────────────────────────────────────────────
function LineChart({ color }: { color: string }) {
  const pts = [40, 55, 38, 70, 50, 80, 60];
  const maxY = Math.max(...pts);
  const W = 200; const H = 60;
  const points = pts.map((v, i) => `${(i / (pts.length - 1)) * W},${H - (v / maxY) * H}`).join(' ');
  const area = `0,${H} ${points} ${W},${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#lg)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((v, i) => (
        <circle key={i} cx={(i / (pts.length - 1)) * W} cy={H - (v / maxY) * H} r={i === 5 ? 4 : 2.5}
          fill={color} stroke="white" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

// ─── Donut chart SVG ─────────────────────────────────────────────────────────
function DonutChart({ colors }: { colors: string[] }) {
  const slices = [38, 27, 22, 13];
  const total = slices.reduce((a, b) => a + b, 0);
  const r = 36; const cx = 50; const cy = 50;
  let angle = -90;
  const arcs = slices.map((s, i) => {
    const startAngle = angle;
    const sweep = (s / total) * 360;
    angle += sweep;
    const start = polar(cx, cy, r, startAngle);
    const end = polar(cx, cy, r, angle - 0.5);
    const large = sweep > 180 ? 1 : 0;
    return { d: `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`, color: colors[i % colors.length] };
  });
  return (
    <svg viewBox="0 0 100 100" className="w-full max-w-[100px]">
      {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} opacity={i === 0 ? 1 : 0.5 + i * 0.1} />)}
      <circle cx={cx} cy={cy} r={22} fill="white" />
    </svg>
  );
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// ─── CARDS TAB ───────────────────────────────────────────────────────────────
function CardsPreview({ primary, secondary, accent, palette }: ReturnType<typeof resolveColors> & { palette: GeneratedPalette }) {
  const textOnPrimary = getContrastColor(primary.hex);
  const textOnSecondary = getContrastColor(secondary.hex);
  const textOnAccent = getContrastColor(accent.hex);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Feature card */}
      <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: primary.hex }}>
        <div className="h-32 opacity-20" style={{ background: `linear-gradient(135deg, ${secondary.hex}, transparent)` }} />
        <div className="p-5 -mt-8">
          <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full mb-3 inline-block"
            style={{ backgroundColor: `${textOnPrimary}18`, color: textOnPrimary }}>
            {palette.mood?.split(',')[0]?.trim() ?? 'Featured'}
          </span>
          <p className="text-lg font-semibold leading-tight mt-2" style={{ color: textOnPrimary }}>
            {palette.name}
          </p>
          <p className="text-xs mt-1.5 opacity-70" style={{ color: textOnPrimary }}>
            {palette.description}
          </p>
        </div>
      </div>

      {/* Stats + chart card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
        <div>
          <p className="text-xs text-gray-400 font-medium">Monthly spend</p>
          <p className="text-2xl font-semibold text-gray-900 mt-0.5">$14,919</p>
        </div>
        <BarChart color={primary.hex} accent={accent.hex} />
        <div className="flex justify-between">
          {months.map(m => <span key={m} className="text-[10px] text-gray-300">{m}</span>)}
        </div>
      </div>

      {/* Second feature card */}
      <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: secondary.hex }}>
        <div className="h-28 opacity-25" style={{ background: `linear-gradient(225deg, ${accent.hex}, transparent)` }} />
        <div className="p-5 -mt-6 space-y-2">
          <div className="flex gap-2 flex-wrap">
            {(palette.colors.slice(0, 3)).map((c, i) => (
              <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${textOnSecondary}15`, color: textOnSecondary }}>
                {c.role ?? 'color'}
              </span>
            ))}
          </div>
          <p className="text-lg font-semibold" style={{ color: textOnSecondary }}>
            Explore the palette
          </p>
          <p className="text-xs opacity-60" style={{ color: textOnSecondary }}>
            {palette.colors.length} colors · {palette.gradients.length} gradients
          </p>
        </div>
      </div>

      {/* Blog-style card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-20" style={{ background: `linear-gradient(135deg, ${primary.hex}, ${accent.hex})` }} />
        <div className="p-4 space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${primary.hex}18`, color: primary.hex }}>
            Design
          </span>
          <p className="text-sm font-semibold text-gray-900 leading-snug">Color in motion — how palettes shape perception</p>
          <p className="text-xs text-gray-400">4 min read</p>
        </div>
      </div>

      {/* Income card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-3">
        <p className="text-xs text-gray-400 font-medium">Income overview</p>
        <p className="text-xl font-semibold text-gray-900">$15,989</p>
        <LineChart color={primary.hex} />
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${primary.hex}18`, color: primary.hex }}>
            +12% vs last period
          </span>
        </div>
      </div>

      {/* Accent CTA card */}
      <div className="rounded-2xl shadow-sm p-5 flex flex-col justify-between min-h-[160px]"
        style={{ backgroundColor: accent.hex }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70" style={{ color: textOnAccent }}>
            Ready to ship
          </p>
          <p className="text-lg font-semibold mt-1 leading-tight" style={{ color: textOnAccent }}>
            Take your palette live
          </p>
        </div>
        <button className="self-start text-xs font-semibold px-4 py-2 rounded-full transition-opacity hover:opacity-80"
          style={{ backgroundColor: textOnAccent, color: accent.hex }}>
          Export →
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD TAB ────────────────────────────────────────────────────────────
function DashboardPreview({ primary, secondary, accent, neutral, palette }: ReturnType<typeof resolveColors> & { palette: GeneratedPalette }) {
  const navItems = ['Overview', 'Analytics', 'Products', 'Settings'];

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex h-[340px]">
      {/* Sidebar */}
      <div className="w-40 shrink-0 flex flex-col p-4 gap-1" style={{ backgroundColor: neutral.hex }}>
        <p className="text-[11px] font-bold mb-3 tracking-tight" style={{ color: getContrastColor(neutral.hex) }}>
          {palette.name}
        </p>
        {navItems.map((item, i) => (
          <div key={item} className="px-2 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              backgroundColor: i === 0 ? `${primary.hex}` : 'transparent',
              color: i === 0 ? getContrastColor(primary.hex) : `${getContrastColor(neutral.hex)}80`,
            }}>
            {item}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-50 p-5 overflow-auto space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">Overview</p>
          <span className="text-xs px-3 py-1 rounded-full text-white font-medium"
            style={{ backgroundColor: primary.hex }}>
            This month
          </span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Revenue', value: '$48,295', color: primary.hex },
            { label: 'Users', value: '12,847', color: secondary.hex },
            { label: 'Conversion', value: '3.24%', color: accent.hex },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <div className="w-5 h-5 rounded-md mb-2" style={{ backgroundColor: `${s.color}25` }}>
                <div className="w-2.5 h-2.5 rounded-sm m-auto mt-1.5" style={{ backgroundColor: s.color }} />
              </div>
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-sm font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 mb-3">Weekly performance</p>
          <BarChart color={primary.hex} accent={accent.hex} values={[60, 45, 80, 55, 90, 70, 85]} />
        </div>
      </div>
    </div>
  );
}

// ─── CHARTS TAB ──────────────────────────────────────────────────────────────
function ChartsPreview({ primary, secondary, accent, palette }: ReturnType<typeof resolveColors> & { palette: GeneratedPalette }) {
  const chartColors = palette.colors.slice(0, 4).map(c => c.hex);
  const legendItems = ['Groceries', 'Housing', 'Travel', 'Other'];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Bar chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <p className="text-xs font-medium text-gray-500">Monthly Revenue</p>
        <p className="text-xl font-bold text-gray-900">$48,295</p>
        <BarChart color={primary.hex} accent={accent.hex} />
        <div className="flex justify-between">
          {['Jan','Feb','Mar','Apr','May','Jun','Jul'].map(m => (
            <span key={m} className="text-[9px] text-gray-300">{m}</span>
          ))}
        </div>
      </div>

      {/* Line chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <p className="text-xs font-medium text-gray-500">User Growth</p>
        <p className="text-xl font-bold text-gray-900">12,847</p>
        <LineChart color={secondary.hex} />
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: secondary.hex }} />
          <span className="text-[10px] text-gray-400">Active users</span>
        </div>
      </div>

      {/* Donut chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <p className="text-xs font-medium text-gray-500">Spend breakdown</p>
        <div className="flex items-center gap-4">
          <DonutChart colors={chartColors} />
          <div className="space-y-2">
            {legendItems.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: chartColors[i % chartColors.length], opacity: i === 0 ? 1 : 0.5 + i * 0.1 }} />
                <span className="text-[10px] text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GRADIENTS TAB ───────────────────────────────────────────────────────────
function GradientsPreview({ primary, secondary, accent, palette }: ReturnType<typeof resolveColors> & { palette: GeneratedPalette }) {
  const generated = palette.gradients;

  // Auto-compose gradients from palette colors if we have < 3
  const extra = [
    { name: 'Soft Wash', from: secondary.hex, to: accent.hex, direction: '120deg', usage: undefined },
    { name: 'Brand Depth', from: primary.hex, to: secondary.hex, direction: '45deg', usage: undefined },
  ];
  const all = [...generated, ...extra].slice(0, 6);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {all.map((g, i) => {
        const css = `linear-gradient(${g.direction ?? '135deg'}, ${g.from}, ${g.to})`;
        const textColor = getContrastColor(g.from);
        return (
          <div key={i} className="rounded-2xl overflow-hidden shadow-sm">
            <div className="h-28 relative" style={{ background: css }}>
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <p className="text-sm font-semibold" style={{ color: textColor }}>{g.name}</p>
                {g.usage && <p className="text-xs opacity-70 mt-0.5" style={{ color: textColor }}>{g.usage}</p>}
              </div>
            </div>
            <div className="bg-white border-x border-b border-gray-100 rounded-b-2xl px-4 py-2.5 flex gap-3">
              <span className="text-[10px] font-mono text-gray-400">{g.from.toUpperCase()}</span>
              <span className="text-[10px] text-gray-200">→</span>
              <span className="text-[10px] font-mono text-gray-400">{g.to.toUpperCase()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── TYPOGRAPHY TAB ───────────────────────────────────────────────────────────
function TypographyPreview({ primary, secondary, accent, palette }: ReturnType<typeof resolveColors> & { palette: GeneratedPalette }) {
  return (
    <div className="space-y-8 max-w-2xl">
      {/* Heading scale */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Heading scale</p>
        <p className="text-4xl font-display font-light leading-tight" style={{ color: primary.hex }}>
          {palette.name}
        </p>
        <p className="text-2xl font-display font-light leading-tight text-gray-800">
          {palette.description}
        </p>
        <p className="text-lg font-medium" style={{ color: secondary.hex }}>
          Designed for exploration and direction
        </p>
        <p className="text-sm font-medium text-gray-500">
          Subtitle — {palette.mood ?? 'evocative, considered, refined'}
        </p>
        <p className="text-sm text-gray-400 leading-relaxed max-w-md">
          Body text flows clearly across surfaces. Good color systems support readable
          type at every weight and contrast level, ensuring content reaches its audience.
        </p>
      </div>

      {/* Tags + buttons */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Components</p>
        <div className="flex flex-wrap gap-2">
          {palette.colors.map((c, i) => (
            <span key={i} className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ backgroundColor: `${c.hex}20`, color: c.hex }}>
              {c.name}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button className="px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm"
            style={{ backgroundColor: primary.hex, color: getContrastColor(primary.hex) }}>
            Primary action
          </button>
          <button className="px-5 py-2.5 rounded-xl text-sm font-medium border"
            style={{ borderColor: primary.hex, color: primary.hex }}>
            Secondary
          </button>
          <button className="px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: `${accent.hex}18`, color: accent.hex }}>
            Soft accent
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function PalettePreview({ palette }: Props) {
  const [tab, setTab] = useState<Tab>('cards');
  const resolved = resolveColors(palette);

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-gray-100">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-gray-900 text-gray-900 font-medium'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'cards'      && <CardsPreview      {...resolved} palette={palette} />}
      {tab === 'dashboard'  && <DashboardPreview  {...resolved} palette={palette} />}
      {tab === 'charts'     && <ChartsPreview     {...resolved} palette={palette} />}
      {tab === 'gradients'  && <GradientsPreview  {...resolved} palette={palette} />}
      {tab === 'typography' && <TypographyPreview {...resolved} palette={palette} />}
    </div>
  );
}
