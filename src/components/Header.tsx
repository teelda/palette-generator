import type { Mode } from '../types';

const MODES: { id: Mode; label: string; desc: string }[] = [
  { id: 'mood', label: 'Mood', desc: 'AI-driven from a scene or feeling' },
  { id: 'monochrome', label: 'Monochrome', desc: 'Full shade scale from one color' },
  { id: 'brand', label: 'Brand', desc: 'Complete system for products & brands' },
];

interface Props {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export function Header({ mode, onChange }: Props) {
  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-8">
        <span className="font-display text-lg font-light text-gray-900 tracking-tight">
          Palette
        </span>

        <nav className="flex items-center gap-1">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              title={m.desc}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                mode === m.id
                  ? 'bg-gray-900 text-white font-medium'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
