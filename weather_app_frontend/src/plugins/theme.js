import Blits from '@lightningjs/blits'

/**
 * Ocean Professional Theme Tokens and Utilities
 * Can be imported app-wide and referenced in components:
 *   import theme from '@/plugins/theme'
 *   this.color = theme.colors.primary
 *   const gradient = theme.utils.gradient(theme.colors.primary, theme.colors.background)
 */

// Core color palette (from style_guide)
const colors = {
  primary: '#2563EB',       // Blue 600
  secondary: '#F59E0B',     // Amber 500 (also acts as success accent)
  success: '#F59E0B',       // Using secondary as success to match style guide
  error: '#EF4444',         // Red 500
  text: '#111827',          // Gray 900
  surface: '#ffffff',       // White
  background: '#f9fafb',    // Gray 50
  mutedText: '#4B5563',     // Gray 600 for secondary text
  border: '#E5E7EB',        // Gray 200
  overlay: 'rgba(17, 24, 39, 0.5)', // semi-transparent overlay
}

// Spacing scale (px). Use with layout and component spacing.
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
}

// Radii for rounded corners
const radii = {
  none: 0,
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 9999,
}

// Elevation presets for subtle depth on large screens
// Lightning uses alpha for visual depth; we provide common shadow-like overlays
const elevation = {
  none: { alpha: 1.0, overlay: 'rgba(0,0,0,0.00)' },
  '1': { alpha: 1.0, overlay: 'rgba(0,0,0,0.04)' },
  '2': { alpha: 1.0, overlay: 'rgba(0,0,0,0.08)' },
  '3': { alpha: 1.0, overlay: 'rgba(0,0,0,0.12)' },
  '4': { alpha: 1.0, overlay: 'rgba(0,0,0,0.16)' },
}

// Typography suggestions (for consistency across components)
const typography = {
  // Sizes are reference values; use with Text component fontSize
  display: 64,
  h1: 48,
  h2: 36,
  h3: 28,
  body: 24,
  caption: 20,
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
}

// Helpers / utilities
const utils = {
  /**
   * Simple vertical gradient helper.
   * Returns a gradient descriptor that can be used by components that support texture generation.
   * Note: Lightning/Blits doesn't support CSS gradients; app code should generate textures/shaders if needed.
   * For convenience, we also return a fallback color (the "to" color).
   */
  // PUBLIC_INTERFACE
  gradient(fromColor = colors.primary, toColor = colors.background, alpha = 1.0) {
    /** Returns an object describing a vertical gradient with a fallback color. */
    return {
      type: 'linear-vertical',
      from: fromColor,
      to: toColor,
      alpha,
      fallback: toColor,
    }
  },

  /**
   * Apply elevation overlay color onto a base color.
   * Returns an RGBA string that can be used as an overlay element color.
   */
  // PUBLIC_INTERFACE
  elevationOverlay(level = 1) {
    /** Returns overlay RGBA for a given elevation level. */
    const preset = elevation[String(level)] || elevation['1']
    return preset.overlay
  },
}

// Theme object
const theme = {
  name: 'Ocean Professional',
  colors,
  spacing,
  radii,
  elevation,
  typography,
  utils,
}

/**
 * Optional: Provide as a Blits plugin so it can be accessed via this.$theme in components
 * Usage:
 *   import Theme from '@/plugins/theme'
 *   export default Blits.Application({ plugins: [Theme.plugin], ... })
 * Then inside components: this.$theme.colors.primary
 */
const plugin = {
  // PUBLIC_INTERFACE
  install(app) {
    /** Installs the theme on the Blits application for global access via this.$theme. */
    app.provide('theme', theme)
    // Convenience getter
    app.mixin({
      computed: {
        $theme() {
          return theme
        },
      },
    })
  },
}

export default {
  ...theme,
  plugin,
}

export { colors, spacing, radii, elevation, typography, utils }
