import { useState } from 'react';
import { generateMoodPalette } from '../lib/claude';
import type { GeneratedPalette } from '../types';
import { ColorSwatch } from './ColorSwatch';
import { GradientStrip } from './GradientStrip';
import { PalettePreview } from './PalettePreview';

const PROMPTS = [
  'Golden hour at a coastal café in Lisbon',
  'Midnight rainstorm in a neon-lit city',
  'Early morning fog over a pine forest',
  'A warm, lived-in library with leather chairs',
  'Desert blooms after unexpected rain',
  'Underwater light through shallow coral',
  'A dusty archive in late afternoon light',
];

interface Props {
  onSave: (name: string, data: GeneratedPalette) => void;
}

export function MoodGenerator({ onSave }: Props) {
  const [prompt, setPrompt] = useState('');
  const [palette, setPalette] = useState<GeneratedPalette | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function generate(text?: string) {
    const input = text ?? prompt;
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const result = await generateMoodPalette(input);
      setPalette(result);
      if (text) setPrompt(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Check your API key.');
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!palette) return;
    onSave(palette.name, palette);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start">
      {/* Input panel */}
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
            Describe a mood, scene, or feeling
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && e.metaKey && generate()}
            placeholder="e.g. Golden hour at a coastal café in Lisbon…"
            rows={4}
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
          <p className="text-xs text-gray-300 mt-1.5 text-right">⌘ + Enter to generate</p>
        </div>

        <button
          onClick={() => generate()}
          disabled={loading || !prompt.trim()}
          className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating…
            </span>
          ) : (
            'Generate Palette'
          )}
        </button>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Prompt suggestions */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
            Try one of these
          </p>
          <div className="flex flex-wrap gap-2">
            {PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => generate(p)}
                disabled={loading}
                className="text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 transition-colors disabled:opacity-40 text-left leading-snug"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Palette output */}
      {palette ? (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display font-light text-gray-900">{palette.name}</h2>
              {palette.mood && (
                <p className="text-sm text-gray-400 mt-1 italic">{palette.mood}</p>
              )}
              <p className="text-sm text-gray-500 mt-1.5 leading-snug max-w-md">
                {palette.description}
              </p>
            </div>
            <button
              onClick={handleSave}
              className="shrink-0 text-xs font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-400 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {saved ? 'Saved!' : 'Save Palette'}
            </button>
          </div>

          {/* Colors */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
              Colors
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {palette.colors.map((color, i) => (
                <ColorSwatch key={i} color={color} showExtras />
              ))}
            </div>
          </div>

          {/* Gradients */}
          {palette.gradients.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
                Gradients
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {palette.gradients.map((g, i) => (
                  <GradientStrip key={i} gradient={g} />
                ))}
              </div>
            </div>
          )}

          {/* UI Preview */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-5">
              Preview in UI
            </p>
            <PalettePreview palette={palette} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 rounded-2xl border border-dashed border-gray-200 text-gray-300 text-sm">
          Your palette will appear here
        </div>
      )}
    </div>
  );
}
