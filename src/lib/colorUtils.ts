import chroma from 'chroma-js';
import type { ShadeScale } from '../types';

export function generateShadeScale(hex: string): ShadeScale {
  const base = chroma(hex);
  const hsl = base.hsl();
  const h = hsl[0] || 0;
  const s = hsl[1] || 0;

  const lightEnd = chroma.hsl(h, Math.max(s - 0.1, 0.05), 0.97).hex();
  const darkEnd = chroma.hsl(h, Math.min(s + 0.1, 1), 0.1).hex();

  const scale = chroma.scale([lightEnd, hex, darkEnd]).mode('lab').colors(11);

  return {
    50:  scale[0],
    100: scale[1],
    200: scale[2],
    300: scale[3],
    400: scale[4],
    500: scale[5],
    600: scale[6],
    700: scale[7],
    800: scale[8],
    900: scale[9],
    950: scale[10],
  };
}

export function getContrastColor(hex: string): string {
  try {
    return chroma(hex).luminance() > 0.35 ? '#111111' : '#ffffff';
  } catch {
    return '#111111';
  }
}

export function generateGradientCSS(from: string, to: string, direction = '135deg'): string {
  return `linear-gradient(${direction}, ${from}, ${to})`;
}

export function generateMultiStopGradient(colors: string[], direction = '135deg'): string {
  return `linear-gradient(${direction}, ${colors.join(', ')})`;
}

export function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const [r, g, b] = chroma(hex).rgb();
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const [h, s, l] = chroma(hex).hsl();
  return {
    h: Math.round(h || 0),
    s: Math.round((s || 0) * 100),
    l: Math.round((l || 0) * 100),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return chroma.rgb(
    Math.max(0, Math.min(255, r)),
    Math.max(0, Math.min(255, g)),
    Math.max(0, Math.min(255, b))
  ).hex();
}

// s and l are 0–100
export function hslToHex(h: number, s: number, l: number): string {
  return chroma.hsl(
    Math.max(0, Math.min(360, h)),
    Math.max(0, Math.min(100, s)) / 100,
    Math.max(0, Math.min(100, l)) / 100
  ).hex();
}

export function shadeScaleToCSSVars(scale: ShadeScale, prefix = 'color'): string {
  return Object.entries(scale)
    .map(([step, hex]) => `  --${prefix}-${step}: ${hex};`)
    .join('\n');
}

export function shadeScaleToTailwind(scale: ShadeScale): string {
  const entries = Object.entries(scale)
    .map(([step, hex]) => `      ${step}: '${hex}',`)
    .join('\n');
  return `colors: {\n  brand: {\n${entries}\n  }\n}`;
}
