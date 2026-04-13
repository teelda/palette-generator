import { useState, useEffect } from 'react';
import type { SavedPalette } from '../types';

const STORAGE_KEY = 'palette_saved_v1';

export function useSavedPalettes() {
  const [saved, setSaved] = useState<SavedPalette[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved]);

  function save(palette: Omit<SavedPalette, 'id' | 'createdAt'>): string {
    const entry: SavedPalette = {
      ...palette,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setSaved(prev => [entry, ...prev]);
    return entry.id;
  }

  function remove(id: string) {
    setSaved(prev => prev.filter(p => p.id !== id));
  }

  function rename(id: string, name: string) {
    setSaved(prev => prev.map(p => (p.id === id ? { ...p, name } : p)));
  }

  return { saved, save, remove, rename };
}
