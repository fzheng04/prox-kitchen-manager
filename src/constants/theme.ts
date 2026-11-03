/**
 * Prox design tokens, ported from assets/design-system/tokens/*.css.
 * The design is a single light theme: night chrome over an oat "kitchen counter" ground.
 */
import type { Category } from '@/logic/types';

export const Colors = {
  night900: '#1C2233',
  night800: '#262E44',
  night700: '#2F3A55',
  tomato500: '#E4572E',
  tomato600: '#C8461F',
  money600: '#1F8A5B',
  money100: '#DDF0E4',
  sage300: '#D3E6C8',
  sage400: '#A9CC97',
  oat200: '#E9E1D2',
  oat100: '#F5F0E6',
  oat50: '#FBF8F2',
  white: '#FFFFFF',
  ink: '#1E1E24',
  inkSoft: '#3B3B45',
  stone600: '#64646E',
  stone500: '#80808A',
  stone400: '#A3A3AC',
  stone300: '#D2D0CA',
  stone200: '#E7E3DB',
  mustard500: '#E9A23B',
  mustard300: '#F6CB6E',
  red500: '#B3261E',
  red100: '#F9DEDA',

  // Semantic aliases
  surfaceApp: '#F5F0E6',
  surfaceCard: '#FBF8F2',
  surfaceRaised: '#FFFFFF',
  surfaceHeader: '#1C2233',
  surfaceDeep: '#2F3A55',
  textPrimary: '#1E1E24',
  textSecondary: '#64646E',
  textMuted: '#80808A',
  textPlaceholder: '#A3A3AC',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: '#C3C8D6',
  borderStrong: '#1E1E24',
  borderSubtle: '#E7E3DB',
  accent: '#E4572E',
  accentPressed: '#C8461F',
  price: '#1F8A5B',
  priceOnDark: '#F6CB6E',
  indicator: '#F6CB6E',
  danger: '#B3261E',
  dangerBg: '#F9DEDA',
} as const;

export const CategoryColors: Record<Category, { bg: string; swatch: string }> = {
  produce: { bg: '#DCEBD3', swatch: '#4E9A5B' },
  dairy: { bg: '#FBF0CF', swatch: '#E0A93A' },
  meat: { bg: '#F6D9D3', swatch: '#D9735F' },
  pantry: { bg: '#F1E2CC', swatch: '#B48A55' },
  essentials: { bg: '#D9E3F4', swatch: '#4C72B8' },
  frozen: { bg: '#E3DDF2', swatch: '#7D6AB8' },
};

/** Font family names registered by useFonts in src/app/_layout.tsx. */
export const Fonts = {
  display: 'BricolageGrotesque_700Bold',
  displayHeavy: 'BricolageGrotesque_800ExtraBold',
  body: 'SplineSans_400Regular',
  bodyMedium: 'SplineSans_500Medium',
  bodySemibold: 'SplineSans_600SemiBold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  eight: 32,
  sixteen: 64,
  gutter: 16,
} as const;

export const Radius = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

/** Straight-down, unblurred ink "tile" shadow heights. */
export const ShadowDepth = { sm: 2, md: 3, lg: 4 } as const;

export const Border = { width: 2, thin: 1.5 } as const;

export const MaxContentWidth = 800;
