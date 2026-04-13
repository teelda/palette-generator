import { useState } from 'react';
import { getContrastColor, hexToRgb, hexToHsl } from '../lib/colorUtils';
import type { PaletteColor } from '../types';

interface Props {
  color: PaletteColor;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  showExtras?: boolean;
}

export function ColorSwatch({ color, size = 'md', showDetails = true, showExtras = false }: Props) {
  const [copied, setCopied] = useState(false);
  const textColor = getContrastColor(color.hex);

  async function copy() {
    await navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  const heights: Record<string, string> = { sm: 'h-14', md: 'h-28', lg: 'h-40' };
  const rgb = hexToRgb(color.hex);
  const hsl = hexToHsl(color.hex);

  return (
    <div className="group flex flex-col cursor-pointer" onClick={copy}>
      <div
        className={`${heights[size]} rounded-xl relative overflow-hidden transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shadow-sm`}
        style={{ backgroundColor: color.hex }}
      >
        {color.role && (
          <span
            className="absolute top-2.5 left-2.5 text-[10px] font-medium uppercase tracking-widest px-1.5 py-0.5 rounded-full opacity-70"
            style={{ color: textColor, backgroundColor: `${textColor}18` }}
          >
            {color.role}
          </span>
        )}
        <div
          className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ color: textColor }}
        >
          <span className="text-xs font-mono font-semibold tracking-wide">
            {copied ? 'Copied!' : color.hex.toUpperCase()}
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-2.5 space-y-0.5">
          <p className="text-sm font-medium text-gray-900 leading-tight">{color.name}</p>
          <p className="text-xs font-mono text-gray-400">{color.hex.toUpperCase()}</p>
          {showExtras && (
            <p className="text-xs text-gray-400">
              rgb({rgb.r}, {rgb.g}, {rgb.b}) &nbsp;·&nbsp; hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
            </p>
          )}
          {color.usage && (
            <p className="text-xs text-gray-400 leading-snug pt-0.5">{color.usage}</p>
          )}
        </div>
      )}
    </div>
  );
}
