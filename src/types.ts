export type Mode = 'mood' | 'monochrome' | 'brand';

export interface PaletteColor {
  hex: string;
  name: string;
  role?: string;
  usage?: string;
}

export interface PaletteGradient {
  name: string;
  from: string;
  to: string;
  stops?: string[];
  direction?: string;
  usage?: string;
}

export interface GeneratedPalette {
  name: string;
  description: string;
  mood?: string;
  colors: PaletteColor[];
  gradients: PaletteGradient[];
}

export interface ProductPalette {
  name: string;
  accent: PaletteColor;
  supportingColors: PaletteColor[];
}

export interface BrandPalette {
  brandName: string;
  personality: string;
  primary: PaletteColor[];
  secondary: PaletteColor[];
  neutrals: PaletteColor[];
  products: ProductPalette[];
  gradients: PaletteGradient[];
}

export interface SavedPalette {
  id: string;
  name: string;
  mode: Mode;
  createdAt: number;
  data: GeneratedPalette | BrandPalette;
  monochromeBase?: string;
}

export interface ShadeScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}
