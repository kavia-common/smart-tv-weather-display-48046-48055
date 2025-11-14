import Blits from '@lightningjs/blits'
import theme from '../plugins/theme.js'

/**
 * Toast: Transient top-banner notification for info/error.
 * - Props:
 *    - message: string
 *    - type: 'info' | 'error'
 *    - duration: ms to auto-hide (default 3000)
 * - Methods:
 *    - show(message, type?, duration?)
 *    - hide()
 */
export default Blits.Component('Toast', {
  props: ['message', 'type', 'duration'],

  state() {
    return {
      visible: false,
      y: -120,
      currentMessage: this.message || '',
      currentType: this.type || 'info'
    }
  },

  template: `
    <Element :x="$x" :y="$y" :w="$w" h="100" :alpha="$visible ? 1 : 0" :zIndex="10">
      <!-- Background bar -->
      <Element
        :x="$pad" :y="16"
        :w="$w - ($pad * 2)"
        h="68"
        :color="$bgColor"
        :shader="$bgRadius"
      />
      <!-- Text -->
      <Text
        :x="$pad + 28" y="36"
        :content="$currentMessage"
        :color="$textOnAccent"
        fontSize="32"
      />
    </Element>
  `,

  computed: {
    w() {
      return this.stage.w || 1920
    },
    x() {
      return 0
    },
    pad() {
      return 32
    },
    bgRadius() {
      return { type: 'radius', radius: 16 }
    },
    textOnAccent() {
      // White text on colored background
      return 0xffFFFFFF
    },
    bgColor() {
      if (this.currentType === 'error') {
        return theme.error || 0xffEF4444
      }
      // info uses primary
      return theme.primary || 0xff2563EB
    }
  },

  methods: {
    // PUBLIC_INTERFACE
    show(message, type = 'info', duration = 3000) {
      /** Show the toast with message and type, auto-dismiss after duration. */
      this.currentMessage = message
      this.currentType = type
      this._animateIn()
      if (this._hideTimer) clearTimeout(this._hideTimer)
      this._hideTimer = setTimeout(() => {
        this.hide()
      }, duration)
    },

    // PUBLIC_INTERFACE
    hide() {
      /** Hide the toast with slide up animation. */
      this._animateOut()
    },

    _animateIn() {
      this.visible = true
      // Simple animation: slide from -120 to 0
      this.setSmooth('y', 0, { duration: 0.25 })
    },

    _animateOut() {
      this.setSmooth('y', -120, { duration: 0.25 })
      // After animation completes, make invisible
      setTimeout(() => {
        this.visible = false
      }, 260)
    }
  },

  input: {
    enter() {
      // Dismiss on enter
      this.hide()
    },
    back(e) {
      // Let back bubble
      if (this.parent && this.parent.focus) this.parent.focus(e)
    }
  }
})
