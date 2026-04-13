import { useState, useMemo } from 'react';
import {
  generateShadeScale,
  getContrastColor,
  isValidHex,
  hexToRgb,
  hexToHsl,
  rgbToHex,
  hslToHex,
  shadeScaleToCSSVars,
  shadeScaleToTailwind,
} from '../lib/colorUtils';
import type { GeneratedPalette } from '../types';

type ColorFormat = 'hex' | 'rgb' | 'hsl';

const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

interface Props {
  onSave: (name: string, data: GeneratedPalette) => void;
}

// ─── Shade chip ───────────────────────────────────────────────────────────────
function ShadeChip({ step, hex }: { step: number; hex: string }) {
  const [copied, setCopied] = useState(false);
  const text = getContrastColor(hex);

  async function copy() {
    await navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="group flex flex-col items-center gap-1.5 cursor-pointer" onClick={copy}>
      <div
        className="w-full aspect-square rounded-lg transition-all duration-150 hover:scale-105 shadow-sm flex items-end justify-center pb-1.5"
        style={{ backgroundColor: hex }}
      >
        <span
          className="text-[10px] font-mono opacity-0 group-hover:opacity-80 transition-opacity"
          style={{ color: text }}
        >
          {copied ? '✓' : hex.toUpperCase().replace('#', '')}
        </span>
      </div>
      <span className="text-[11px] text-gray-400 font-medium">{step}</span>
    </div>
  );
}

// ─── Channel input ─────────────────────────────────────────────────────────────
function ChannelInput({
  label, value, min, max, onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');

  function handleFocus() {
    setFocused(true);
    setDraft(String(value));
  }

  function handleBlur() {
    setFocused(false);
    const n = Math.max(min, Math.min(max, parseInt(draft) || 0));
    onChange(n);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '');
    setDraft(raw);
    const n = parseInt(raw);
    if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        value={focused ? draft : String(value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        className="w-14 text-center rounded-lg border border-gray-200 px-1 py-2 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      />
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function MonochromeBuilder({ onSave }: Props) {
  const [hex, setHex] = useState('#6366F1');
  const [hexInput, setHexInput] = useState('#6366F1');
  const [format, setFormat] = useState<ColorFormat>('hex');
  const [exportMode, setExportMode] = useState<'css' | 'tailwind' | null>(null);
  const [saved, setSaved] = useState(false);

  const scale = useMemo(() => (isValidHex(hex) ? generateShadeScale(hex) : null), [hex]);
  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => hexToHsl(hex), [hex]);

  // ── Hex input ──────────────────────────────────────────────────────────────
  function handleHexInput(val: string) {
    setHexInput(val);
    const clean = val.startsWith('#') ? val : `#${val}`;
    if (isValidHex(clean)) setHex(clean);
  }

  function handlePickerChange(val: string) {
    setHex(val);
    setHexInput(val.toUpperCase());
  }

  // ── RGB input ──────────────────────────────────────────────────────────────
  function handleRgb(channel: 'r' | 'g' | 'b', val: number) {
    const next = { ...rgb, [channel]: val };
    const newHex = rgbToHex(next.r, next.g, next.b);
    setHex(newHex);
    setHexInput(newHex.toUpperCase());
  }

  // ── HSL input ──────────────────────────────────────────────────────────────
  function handleHsl(channel: 'h' | 's' | 'l', val: number) {
    const next = { ...hsl, [channel]: val };
    const newHex = hslToHex(next.h, next.s, next.l);
    setHex(newHex);
    setHexInput(newHex.toUpperCase());
  }

  // ── Format switch ──────────────────────────────────────────────────────────
  function switchFormat(f: ColorFormat) {
    setFormat(f);
    if (f === 'hex') setHexInput(hex.toUpperCase());
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  function handleSave() {
    if (!scale) return;
    const palette: GeneratedPalette = {
      name: `${hex.toUpperCase()} Monochrome`,
      description: `Monochrome shade scale built from ${hex.toUpperCase()}`,
      colors: SHADE_STEPS.map(step => ({
        hex: scale[step],
        name: `${step}`,
        role: step === 500 ? 'base' : step < 500 ? 'tint' : 'shade',
      })),
      gradients: [{ name: 'Full Range', from: scale[50], to: scale[950], direction: '90deg' }],
    };
    onSave(palette.name, palette);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const cssVars = scale ? shadeScaleToCSSVars(scale) : '';
  const tailwindConfig = scale ? shadeScaleToTailwind(scale) : '';
  const gradientCSS = scale
    ? `linear-gradient(90deg, ${SHADE_STEPS.map(s => scale[s]).join(', ')})`
    : '';

  return (
    <div className="space-y-10">
      {/* ── Picker + inputs ── */}
      <div className="flex flex-wrap items-end gap-6">

        {/* Color picker swatch */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-widest block">
            Base Color
          </label>
          <input
            type="color"
            value={isValidHex(hex) ? hex : '#6366F1'}
            onChange={e => handlePickerChange(e.target.value)}
            className="w-12 h-12 rounded-xl cursor-pointer border border-gray-200 p-0.5 bg-white"
          />
        </div>

        {/* Format switcher + inputs */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-widest block">
            Format
          </label>

          {/* Segmented control */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit mb-3">
            {(['hex', 'rgb', 'hsl'] as ColorFormat[]).map(f => (
              <button
                key={f}
                onClick={() => switchFormat(f)}
                className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  format === f
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-400 hover:text-gray-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Inputs per format */}
          {format === 'hex' && (
            <input
              type="text"
              value={hexInput}
              onChange={e => handleHexInput(e.target.value)}
              placeholder="#6366F1"
              maxLength={7}
              spellCheck={false}
              className="w-32 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          )}

          {format === 'rgb' && (
            <div className="flex items-end gap-2">
              <ChannelInput label="R" value={rgb.r} min={0} max={255} onChange={v => handleRgb('r', v)} />
              <ChannelInput label="G" value={rgb.g} min={0} max={255} onChange={v => handleRgb('g', v)} />
              <ChannelInput label="B" value={rgb.b} min={0} max={255} onChange={v => handleRgb('b', v)} />
              <span className="text-xs text-gray-300 pb-2.5 font-mono">
                rgb({rgb.r}, {rgb.g}, {rgb.b})
              </span>
            </div>
          )}

          {format === 'hsl' && (
            <div className="flex items-end gap-2">
              <ChannelInput label="H" value={hsl.h} min={0} max={360} onChange={v => handleHsl('h', v)} />
              <ChannelInput label="S" value={hsl.s} min={0} max={100} onChange={v => handleHsl('s', v)} />
              <ChannelInput label="L" value={hsl.l} min={0} max={100} onChange={v => handleHsl('l', v)} />
              <span className="text-xs text-gray-300 pb-2.5 font-mono">
                hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
              </span>
            </div>
          )}
        </div>

        {/* Export + save buttons */}
        {scale && (
          <div className="flex items-center gap-3 pb-0.5">
            <button
              onClick={() => setExportMode(exportMode === 'css' ? null : 'css')}
              className={`text-xs px-3 py-2 rounded-lg border transition-colors ${exportMode === 'css' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
            >
              CSS Vars
            </button>
            <button
              onClick={() => setExportMode(exportMode === 'tailwind' ? null : 'tailwind')}
              className={`text-xs px-3 py-2 rounded-lg border transition-colors ${exportMode === 'tailwind' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
            >
              Tailwind
            </button>
            <button
              onClick={handleSave}
              className="text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 transition-colors"
            >
              {saved ? 'Saved!' : 'Save Scale'}
            </button>
          </div>
        )}
      </div>

      {scale && (
        <>
          {/* Gradient strip */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              Gradient Strip
            </p>
            <div className="h-16 rounded-2xl shadow-sm" style={{ background: gradientCSS }} />
          </div>

          {/* Shade scale */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              Shade Scale — click any chip to copy hex
            </p>
            <div className="grid grid-cols-11 gap-2">
              {SHADE_STEPS.map(step => (
                <ShadeChip key={step} step={step} hex={scale[step]} />
              ))}
            </div>
          </div>

          {/* Export panel */}
          {exportMode && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                {exportMode === 'css' ? 'CSS Custom Properties' : 'Tailwind Config'}
              </p>
              <pre className="bg-gray-950 text-gray-200 rounded-xl p-5 text-xs font-mono overflow-x-auto leading-relaxed">
                {exportMode === 'css' ? `:root {\n${cssVars}\n}` : tailwindConfig}
              </pre>
              <button
                onClick={async () => {
                  const text = exportMode === 'css' ? `:root {\n${cssVars}\n}` : tailwindConfig;
                  await navigator.clipboard.writeText(text);
                }}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                Copy to clipboard
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
