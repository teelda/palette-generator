import { useState } from 'react';
import type { Mode, GeneratedPalette, BrandPalette } from './types';
import { Header } from './components/Header';
import { MoodGenerator } from './components/MoodGenerator';
import { MonochromeBuilder } from './components/MonochromeBuilder';
import { BrandBuilder } from './components/BrandBuilder';
import { SavedPalettes } from './components/SavedPalettes';
import { useSavedPalettes } from './hooks/useSavedPalettes';

export function App() {
  const [mode, setMode] = useState<Mode>('mood');
  const { saved, save, remove, rename } = useSavedPalettes();

  function handleMoodSave(name: string, data: GeneratedPalette) {
    save({ name, mode: 'mood', data });
  }

  function handleMonoSave(name: string, data: GeneratedPalette) {
    save({ name, mode: 'monochrome', data });
  }

  function handleBrandSave(name: string, data: BrandPalette) {
    save({ name, mode: 'brand', data });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header mode={mode} onChange={setMode} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        {/* Mode label */}
        <div className="mb-8">
          {mode === 'mood' && (
            <p className="text-3xl font-display font-light text-gray-800">
              What are you feeling?
            </p>
          )}
          {mode === 'monochrome' && (
            <p className="text-3xl font-display font-light text-gray-800">
              One color, infinite depth.
            </p>
          )}
          {mode === 'brand' && (
            <p className="text-3xl font-display font-light text-gray-800">
              Build a brand system.
            </p>
          )}
        </div>

        {mode === 'mood' && <MoodGenerator onSave={handleMoodSave} />}
        {mode === 'monochrome' && <MonochromeBuilder onSave={handleMonoSave} />}
        {mode === 'brand' && <BrandBuilder onSave={handleBrandSave} />}
      </main>

      <SavedPalettes palettes={saved} onRemove={remove} onRename={rename} />
    </div>
  );
}
