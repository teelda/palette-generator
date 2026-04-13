import { useState } from 'react';
import type { PaletteGradient } from '../types';

interface Props {
  gradient: PaletteGradient;
  height?: string;
}

export function GradientStrip({ gradient, height = 'h-20' }: Props) {
  const [copied, setCopied] = useState(false);
  const direction = gradient.direction ?? '135deg';
  const stops = gradient.stops ? gradient.stops.join(', ') : `${gradient.from}, ${gradient.to}`;
  const css = `linear-gradient(${direction}, ${stops})`;

  async function copy() {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="group cursor-pointer space-y-2.5" onClick={copy}>
      <div
        className={`${height} rounded-xl transition-all duration-150 hover:scale-[1.01] shadow-sm`}
        style={{ background: css }}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{gradient.name}</p>
          {gradient.usage && (
            <p className="text-xs text-gray-400 mt-0.5 leading-snug">{gradient.usage}</p>
          )}
        </div>
        <span className="text-xs text-gray-300 group-hover:text-gray-500 font-mono transition-colors whitespace-nowrap pt-0.5">
          {copied ? 'CSS copied' : 'click to copy'}
        </span>
      </div>
    </div>
  );
}
