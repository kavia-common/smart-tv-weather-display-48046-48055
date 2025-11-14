import Blits from '@lightningjs/blits'
import theme from '../plugins/theme.js'

/**
 * Panel: Reusable container with rounded corners, surface color, and subtle shadow.
 * - Accepts width/height via props or stretches to given size by parent
 * - Optional header text
 * - Focusable: shows accent border and slight scale on focus
 */
export default Blits.Component('Panel', {
  props: [
    'w', 'h',
    'header',     // Optional header text
    'elevated'    // Boolean for stronger shadow
  ],

  state() {
    return {
      focused: false
    }
  },

  template: `
    <Element :w="$panelW" :h="$panelH" :scale="$focused ? 1.02 : 1" :zIndex="$focused ? 2 : 1">
      <!-- Background with rounded corners and shadow -->
      <Element :w="$panelW" :h="$panelH" :color="$surfaceColor" :shader="$bgRadius" />
      <Element :w="$panelW" :h="$panelH" :shader="$shadowShader" />

      <!-- Focus ring -->
      <Element
        x="2" y="2"
        :w="$panelW - 4"
        :h="$panelH - 4"
        :alpha="$focused ? 1 : 0"
        :color="$focusRingColor"
        :shader="$focusRingShader"
      />

      <!-- Header (optional) -->
      <Text
        x="32" y="24"
        :content="$headerText"
        :alpha="$hasHeader ? 1 : 0"
        :color="$textColor"
        fontSize="36"
      />

      <!-- Slot area: children render inside padding -->
      <Element
        :x="$contentX" :y="$contentY"
        :w="$contentW" :h="$contentH"
      >
        <Slot />
      </Element>
    </Element>
  `,

  computed: {
    panelW() {
      return this.w || 600
    },
    panelH() {
      return this.h || 400
    },
    surfaceColor() {
      return theme.surface || 0xffFFFFFF
    },
    textColor() {
      return theme.text || 0xff111827
    },
    focusRingColor() {
      return 0x662563EB
    },
    bgRadius() {
      return { type: 'radius', radius: 20 }
    },
    focusRingShader() {
      return { type: 'radius', radius: 20, stroke: 3 }
    },
    shadowShader() {
      const strength = this.elevated ? 0x55000000 : 0x33000000
      return { type: 'dropShadow', color: strength, blur: this.elevated ? 16 : 10, offsetX: 0, offsetY: 4 }
    },
    hasHeader() {
      return !!this.header
    },
    headerText() {
      return this.header || ''
    },
    // Padding accounts for header if present
    contentX() {
      return 32
    },
    contentY() {
      return this.hasHeader ? 80 : 32
    },
    contentW() {
      return this.panelW - 64
    },
    contentH() {
      return this.panelH - (this.hasHeader ? 112 : 64)
    }
  },

  methods: {
    // PUBLIC_INTERFACE
    focus() {
      /** Focus panel to show ring and scale up slightly. */
      this.focused = true
    },
    // PUBLIC_INTERFACE
    blur() {
      /** Blur panel to hide ring and reset scale. */
      this.focused = false
    }
  },

  input: {
    up(e) {
      if (this.parent && this.parent.focus) this.parent.focus(e)
    },
    down(e) {
      if (this.parent && this.parent.focus) this.parent.focus(e)
    },
    left(e) {
      if (this.parent && this.parent.focus) this.parent.focus(e)
    },
    right(e) {
      if (this.parent && this.parent.focus) this.parent.focus(e)
    },
    enter() {
      // Panels may contain interactive children; noop here.
    },
    back(e) {
      if (this.parent && this.parent.focus) this.parent.focus(e)
    }
  }
})
