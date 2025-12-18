/**
 * Color palette optimized for dark mode (night operation)
 * and readability during radio operations
 */
export const colors = {
  // Primary colors
  primary: '#3B82F6', // Blue
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',

  // Background colors (dark mode optimized)
  background: '#000000',
  backgroundSecondary: '#111111',
  backgroundTertiary: '#1A1A1A',

  // Surface colors
  surface: '#1E1E1E',
  surfaceElevated: '#2A2A2A',
  surfaceHighlight: '#333333',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  textInverse: '#000000',

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Band/Mode colors (for visual distinction)
  bandHF: '#3B82F6', // Blue for HF bands
  bandVHF: '#10B981', // Green for VHF
  bandUHF: '#F59E0B', // Orange for UHF

  // Border colors
  border: '#333333',
  borderLight: '#404040',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
} as const;

export type ColorName = keyof typeof colors;

