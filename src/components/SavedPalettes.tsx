import { useState } from 'react';
import type { SavedPalette, GeneratedPalette, BrandPalette } from '../types';

interface Props {
  palettes: SavedPalette[];
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

function previewColors(p: SavedPalette): string[] {
  if (p.mode === 'monochrome') {
    const data = p.data as GeneratedPalette;
    return data.colors.slice(0, 7).map(c => c.hex);
  }
  if (p.mode === 'brand') {
    const data = p.data as BrandPalette;
    const all = [...data.primary, ...data.secondary, ...(data.neutrals ?? [])];
    return all.slice(0, 7).map(c => c.hex);
  }
  const data = p.data as GeneratedPalette;
  return data.colors.slice(0, 7).map(c => c.hex);
}

function PaletteThumb({ palette, onRemove, onRename }: { palette: SavedPalette; onRemove: () => void; onRename: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(palette.name);
  const colors = previewColors(palette);

  function commit() {
    if (draft.trim()) onRename(draft.trim());
    setEditing(false);
  }

  return (
    <div className="group flex flex-col gap-2 min-w-[200px] max-w-[200px]">
      {/* Color strip */}
      <div className="flex h-12 rounded-xl overflow-hidden shadow-sm">
        {colors.map((hex, i) => (
          <div
            key={i}
            className="flex-1 transition-all duration-200 group-hover:first:rounded-l-xl group-hover:last:rounded-r-xl"
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>

      {/* Name + actions */}
      <div className="flex items-center justify-between gap-1">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => e.key === 'Enter' && commit()}
            className="flex-1 text-xs text-gray-700 border-b border-gray-300 bg-transparent focus:outline-none pb-0.5"
          />
        ) : (
          <button
            className="flex-1 text-xs text-gray-600 text-left truncate hover:text-gray-900 transition-colors"
            onDoubleClick={() => setEditing(true)}
            title="Double-click to rename"
          >
            {palette.name}
          </button>
        )}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-gray-300 uppercase tracking-wider">{palette.mode}</span>
          <button
            onClick={onRemove}
            className="text-gray-300 hover:text-red-400 transition-colors text-sm leading-none"
            title="Remove"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export function SavedPalettes({ palettes, onRemove, onRename }: Props) {
  if (palettes.length === 0) return null;

  return (
    <div className="border-t border-gray-100 bg-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-5">
          Saved Palettes ({palettes.length})
        </p>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {palettes.map(p => (
            <PaletteThumb
              key={p.id}
              palette={p}
              onRemove={() => onRemove(p.id)}
              onRename={name => onRename(p.id, name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
