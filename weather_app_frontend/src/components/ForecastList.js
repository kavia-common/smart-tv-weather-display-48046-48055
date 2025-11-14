import Blits from '@lightningjs/blits'
import ForecastItem from './ForecastItem.js'

/**
 * ForecastList
 * Horizontally scrollable list for daily/hourly forecasts.
 *
 * Props:
 *  - items: Array<{ id, title, subtitle?, icon?, temp?, meta? }>
 *  - itemWidth?: number (default 260)
 *  - itemHeight?: number (default 300)
 *  - spacing?: number (default 24)
 *  - initialIndex?: number (default 0)
 *  - lazyRange?: { from: number, to: number } optional, for :range lazy rendering
 *  - onChange?: function(index, item)
 *  - onEnter?: function(item)
 *  - title?: string optional section title
 *  - theme?: { primary, secondary, surface, text }
 *
 * Navigation:
 *  - left/right moves selection
 *  - enter triggers onEnter callback with the selected item
 */
export default Blits.Component('ForecastList', {
  components: { ForecastItem },

  props: [
    'items',
    'itemWidth',
    'itemHeight',
    'spacing',
    'initialIndex',
    'lazyRange',
    'onChange',
    'onEnter',
    'title',
    'theme',
  ],

  state() {
    const spacing = this.spacing ?? 24
    const itemW = this.itemWidth ?? 260
    const itemH = this.itemHeight ?? 300
    const idx = Math.max(0, Math.min(this.initialIndex ?? 0, Array.isArray(this.items) ? this.items.length - 1 : 0))

    return {
      index: idx,
      itemW,
      itemH,
      spacing,
      offsetX: 0,
    }
  },

  computed: {
    count() {
      return Array.isArray(this.items) ? this.items.length : 0
    },
    containerW() {
      return 1920 // default stage width expected by Blits Launch settings
    },
    containerH() {
      return this.itemH + 120 // title + padding
    },
    palette() {
      const fallback = {
        primary: '#2563EB',
        secondary: '#F59E0B',
        surface: 0xff0b0b0b,
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
    // Calculate scroll so selected item stays visible/centered
    scrollX() {
      const xOfIndex = this.index * (this.itemW + this.spacing)
      const center = (this.containerW - this.itemW) / 2
      let desiredOffset = center - xOfIndex
      // Clamp scrolling so we don't overscroll when near ends
      const minOffset = Math.min(0, this.containerW - (this.count * (this.itemW + this.spacing)))
      const maxOffset = 0
      if (this.count <= 0) return 0
      if (desiredOffset < minOffset) desiredOffset = minOffset
      if (desiredOffset > maxOffset) desiredOffset = maxOffset
      return desiredOffset
    },
  },

  watchers: {
    index(newVal) {
      // Emit change event/callback
      if (typeof this.onChange === 'function') {
        const item = this.items?.[newVal]
        this.onChange(newVal, item)
      }
    },
  },

  template: `
    <Element :w="$containerW" :h="$containerH">
      <!-- Optional section title -->
      <Text
        :content="$title ? $title : ''"
        x="48"
        y="12"
        fontSize="40"
        :alpha="$title ? 1 : 0"
        color="0xFFFFFFFF"
      />

      <!-- Viewport -->
      <Element x="0" :y="$title ? 64 : 12" :w="$containerW" :h="$itemH" clip="true">
        <!-- Track translates to keep focused item near center -->
        <Element :x="$scrollX" y="0" rtt="true">
          <ForecastItem
            :for="(it, idx) in $items"
            :key="$it.id"
            :x="$idx * ($itemW + $spacing)"
            y="0"
            :width="$itemW"
            :height="$itemH"
            :item="$it"
            :focused="$idx === $index"
            :onEnter="$handleEnter"
            :theme="$theme"
          />
        </Element>
      </Element>
    </Element>
  `,

  methods: {
    // PUBLIC_INTERFACE
    focusIndex(idx) {
      /** Programmatically focus a given index within bounds. */
      if (!this.count) return
      const bounded = Math.max(0, Math.min(idx, this.count - 1))
      this.index = bounded
    },

    // PUBLIC_INTERFACE
    getSelectedItem() {
      /** Returns currently selected item or undefined. */
      return this.items?.[this.index]
    },

    handleEnter(item) {
      if (typeof this.onEnter === 'function') {
        this.onEnter(item)
      }
    },
  },

  input: {
    left() {
      if (this.count <= 0) return
      const next = Math.max(0, this.index - 1)
      if (next !== this.index) {
        this.index = next
      } else {
        // Bubble focus to parent when at boundary
        if (this.parent && typeof this.parent.focus === 'function') {
          this.parent.focus()
        }
      }
    },
    right() {
      if (this.count <= 0) return
      const next = Math.min(this.count - 1, this.index + 1)
      if (next !== this.index) {
        this.index = next
      } else {
        if (this.parent && typeof this.parent.focus === 'function') {
          this.parent.focus()
        }
      }
    },
    enter() {
      const sel = this.items?.[this.index]
      if (sel) this.handleEnter(sel)
    },
    back(e) {
      // Let it bubble up to router or page-level handler
      if (this.parent && typeof this.parent.focus === 'function') {
        this.parent.focus(e)
      }
    },
  },
})
