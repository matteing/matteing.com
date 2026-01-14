/**
 * Color utility functions for the MusicPlayer component.
 * Used for calculating contrast, darkening colors, and determining text color.
 */

/**
 * Parse an rgb(r, g, b) string into individual color values.
 */
export function parseRgb(color: string): { r: number; g: number; b: number } | null {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return null;
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3]),
  };
}

/**
 * Calculate relative luminance for WCAG contrast ratio.
 * @see https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determine if light text should be used on a given background color.
 * Returns true for dark backgrounds, false for light backgrounds.
 */
export function shouldUseLightText(bgColor: string | null): boolean {
  if (!bgColor) return true;
  const rgb = parseRgb(bgColor);
  if (!rgb) return true;
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance < 0.5;
}

/**
 * Darken a color by a given percentage.
 * @param color - RGB color string (e.g., "rgb(255, 100, 50)")
 * @param percent - Amount to darken (0-100)
 */
export function darkenColor(color: string | null, percent: number): string | null {
  if (!color) return null;
  const rgb = parseRgb(color);
  if (!rgb) return color;
  
  const factor = 1 - percent / 100;
  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);
  
  return `rgb(${r}, ${g}, ${b})`;
}
