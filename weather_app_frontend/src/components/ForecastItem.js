import Blits from '@lightningjs/blits'

/**
 * ForecastItem
 * Renders a single forecast entry (daily or hourly) with focus state.
 * Props:
 *  - item: { id: string|number, title: string, subtitle?: string, icon?: string, temp?: string|number, meta?: string }
 *  - width?: number (default 260)
 *  - height?: number (default 300)
 *  - focused?: boolean (initial focus visual state, controlled by parent list)
 *  - onEnter?: function(item) -> void
 *  - theme?: { primary, secondary, surface, text }
 */
export default Blits.Component('ForecastItem', {
  props: [
    'item',
    'width',
    'height',
    'focused',
    'onEnter',
    'theme',
  ],

  state() {
    return {
      w: this.width || 260,
      h: this.height || 300,
      isFocused: !!this.focused,
    }
  },

  computed: {
    palette() {
      // Fallback palette if theme not provided via props or plugin
      const fallback = {
        primary: '#2563EB',
        secondary: '#F59E0B',
        surface: 0xff111111,
        text: 0xffffffff,
      }
      const themeData = this.theme || (this.$theme ? this.$theme.colors : null)
      if (!themeData) return fallback
      return {
        primary: themeData.primary || fallback.primary,
        secondary: themeData.secondary || fallback.secondary,
        surface: themeData.surface || fallback.surface,
        text: themeData.text || fallback.text,
      }
    },
  },

  template: `
    <Element :w="$w" :h="$h">
      <!-- Card background -->
      <Element
        :w="$w"
        :h="$h"
        :color="$isFocused ? 0x332563EB : 0x22111827"
        :alpha="$isFocused ? 1 : 0.9"
        rect="true"
        rtt="true"
      />

      <!-- Accent focus bar -->
      <Element
        x="0"
        y="0"
        w="6"
        :h="$h"
        :alpha="$isFocused ? 1 : 0"
        color="0xFFF59E0B"
        rect="true"
      />

      <!-- Icon -->
      <Element
        :x="($w/2) - 48"
        y="24"
        w="96"
        h="96"
        :alpha="$item && $item.icon ? 1 : 0"
        :src="$item && $item.icon ? $item.icon : ''"
      />

      <!-- Title -->
      <Text
        :x="24"
        :y="($item && $item.icon ? 140 : 40)"
        :content="$item && $item.title ? $item.title : ''"
        :color="$isFocused ? 0xFFFFFFFF : 0xFFDDDDDD"
        fontSize="36"
        wordWrap="true"
        :w="$w - 48"
      />

      <!-- Subtitle -->
      <Text
        :x="24"
        :y="($item && $item.icon ? 190 : 88)"
        :content="$item && $item.subtitle ? $item.subtitle : ''"
        color="0xFF9CA3AF"
        fontSize="24"
        wordWrap="true"
        :w="$w - 48"
      />

      <!-- Temperature / Value -->
      <Text
        :x="24"
        :y="$h - 72"
        :content="$item && $item.temp !== undefined ? String($item.temp) : ($item && $item.meta ? $item.meta : '')"
        :color="$isFocused ? 0xFFF59E0B : 0xFFBDC1C6"
        fontSize="40"
        :w="$w - 48"
      />
    </Element>
  `,

  methods: {
    setFocused(val) {
      this.isFocused = !!val
    },
  },

  // Handle focus visuals controlled by parent list
  onFocus() {
    this.isFocused = true
  },

  onUnfocus() {
    this.isFocused = false
  },

  input: {
    // PUBLIC_INTERFACE
    enter() {
      /** Handle enter press to notify parent with the selected item. */
      if (typeof this.onEnter === 'function') {
        this.onEnter(this.item)
      }
    },
  },
})
