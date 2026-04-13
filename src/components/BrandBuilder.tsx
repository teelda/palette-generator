import { useState } from 'react';
import { generateBrandPalette } from '../lib/claude';
import type { BrandPalette, GeneratedPalette } from '../types';
import { ColorSwatch } from './ColorSwatch';
import { GradientStrip } from './GradientStrip';
import { PalettePreview } from './PalettePreview';

function brandToPreviewPalette(brand: BrandPalette): GeneratedPalette {
  return {
    name: brand.brandName,
    description: brand.personality,
    colors: [
      ...brand.primary.map(c => ({ ...c, role: 'primary' as const })),
      ...brand.secondary.map(c => ({ ...c, role: 'secondary' as const })),
      ...(brand.neutrals ?? []).map(c => ({ ...c, role: 'neutral' as const })),
      ...(brand.products[0]?.supportingColors ?? []).map(c => ({ ...c, role: 'accent' as const })),
    ],
    gradients: brand.gradients,
  };
}

const MAX_PRODUCTS = 5;

interface Props {
  onSave: (name: string, data: BrandPalette) => void;
}

export function BrandBuilder({ onSave }: Props) {
  const [brandName, setBrandName] = useState('');
  const [description, setDescription] = useState('');
  const [products, setProducts] = useState<string[]>(['']);
  const [brand, setBrand] = useState<BrandPalette | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  function addProduct() {
    if (products.length < MAX_PRODUCTS) setProducts(p => [...p, '']);
  }

  function removeProduct(i: number) {
    setProducts(p => p.filter((_, idx) => idx !== i));
  }

  function setProduct(i: number, val: string) {
    setProducts(p => p.map((v, idx) => (idx === i ? val : v)));
  }

  async function generate() {
    if (!brandName.trim() || !description.trim()) return;
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const result = await generateBrandPalette(
        brandName,
        description,
        products.filter(Boolean)
      );
      setBrand(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Check your API key.');
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!brand) return;
    onSave(brand.brandName, brand);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start">
      {/* Input panel */}
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-widest block">
            Brand Name
          </label>
          <input
            type="text"
            value={brandName}
            onChange={e => setBrandName(e.target.value)}
            placeholder="e.g. Wowzi"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-widest block">
            Brand Personality
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the brand's tone, audience, and visual direction…"
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Products */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">
              Products (optional)
            </label>
            {products.length < MAX_PRODUCTS && (
              <button
                onClick={addProduct}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                + Add product
              </button>
            )}
          </div>
          <div className="space-y-2">
            {products.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={p}
                  onChange={e => setProduct(i, e.target.value)}
                  placeholder={`Product ${i + 1} name`}
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                {products.length > 1 && (
                  <button
                    onClick={() => removeProduct(i)}
                    className="text-gray-300 hover:text-gray-600 transition-colors px-1"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading || !brandName.trim() || !description.trim()}
          className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Building brand system…
            </span>
          ) : (
            'Generate Brand Palette'
          )}
        </button>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>

      {/* Brand output */}
      {brand ? (
        <div className="space-y-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display font-light text-gray-900">{brand.brandName}</h2>
              <p className="text-sm text-gray-400 mt-1 leading-snug max-w-md">{brand.personality}</p>
            </div>
            <button
              onClick={handleSave}
              className="shrink-0 text-xs font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-400 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {saved ? 'Saved!' : 'Save Brand'}
            </button>
          </div>

          {/* Primary */}
          <Section label="Primary">
            <ColorGrid colors={brand.primary} />
          </Section>

          {/* Secondary */}
          {brand.secondary.length > 0 && (
            <Section label="Secondary">
              <ColorGrid colors={brand.secondary} />
            </Section>
          )}

          {/* Neutrals */}
          {brand.neutrals.length > 0 && (
            <Section label="Neutrals">
              <div className="flex gap-3">
                {brand.neutrals.map((c, i) => (
                  <ColorSwatch key={i} color={c} size="sm" />
                ))}
              </div>
            </Section>
          )}

          {/* Products */}
          {brand.products.map((product, pi) => (
            <Section key={pi} label={`Product — ${product.name}`}>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                <ColorSwatch color={product.accent} />
                {product.supportingColors.map((c, i) => (
                  <ColorSwatch key={i} color={c} size="md" />
                ))}
              </div>
            </Section>
          ))}

          {/* Gradients */}
          {brand.gradients.length > 0 && (
            <Section label="Gradients">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {brand.gradients.map((g, i) => (
                  <GradientStrip key={i} gradient={g} />
                ))}
              </div>
            </Section>
          )}

          {/* UI Preview */}
          <Section label="Preview in UI">
            <PalettePreview palette={brandToPreviewPalette(brand)} />
          </Section>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 rounded-2xl border border-dashed border-gray-200 text-gray-300 text-sm">
          Your brand system will appear here
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">{label}</p>
      {children}
    </div>
  );
}

function ColorGrid({ colors }: { colors: Array<{ hex: string; name: string; role?: string; usage?: string }> }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {colors.map((c, i) => (
        <ColorSwatch key={i} color={c} />
      ))}
    </div>
  );
}
