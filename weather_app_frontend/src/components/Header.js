import Blits from '@lightningjs/blits'
import theme from '../plugins/theme.js'

/**
 * Header component for the app.
 * - Left: Brand/Title
 * - Right: Clock and Location
 * - Uses Ocean Professional theme colors and subtle shadow
 * - Focusable: shows accent border when focused
 */
export default Blits.Component('Header', {
  props: [
    'title',          // App title / brand
    'location',       // Current location string
    'timeFormat'      // '24h' or '12h' for clock display
  ],

  state() {
    return {
      now: this._formatTime(new Date()),
      focused: false
    }
  },

  components: {},

  template: `
    <Element :w="$w" h="120" :color="$surfaceColor" :shader="$headerShadow">
      <!-- Background strip -->
      <Element w="$w" h="120" :color="$surfaceColor" />

      <!-- Focus ring -->
      <Element
        x="24" y="16"
        :w="$w - 48"
        h="88"
        :alpha="$focused ? 1 : 0"
        :color="$focusRingColor"
        :shader="$focusRingShader"
      />

      <!-- Left: Brand / Title -->
      <Text
        x="48" y="36"
        :content="$titleText"
        :color="$textColor"
        fontSize="44"
      />

      <!-- Right: Clock + Location group -->
      <Element :x="$w - 48 - 700" y="24" w="700" h="72">
        <Text
          x="0" y="20"
          :content="$now"
          :color="$primaryColor"
          fontSize="40"
        />
        <Text
          :x="$clockWidth + 24"
          y="20"
          :content="$locationText"
          :color="$secondaryColor"
          fontSize="32"
          :alpha="$locationText ? 1 : 0.6"
        />
      </Element>
    </Element>
  `,

  computed: {
    w() {
      // Uses app stage width
      return this.stage.w || 1920
    },
    surfaceColor() {
      // Theme surface
      return theme.surface || 0xffFFFFFF
    },
    textColor() {
      return theme.text || 0xff111827
    },
    primaryColor() {
      // Blue
      return theme.primary || 0xff2563EB
    },
    secondaryColor() {
      // Amber
      return theme.secondary || 0xffF59E0B
    },
    focusRingColor() {
      // Subtle blue outline with transparency
      return 0x662563EB
    },
    titleText() {
      return this.title || 'Weather'
    },
    locationText() {
      return this.location || '—'
    },
    clockWidth() {
      // Approx width for spacing; text measurement not available, use estimate for 6 characters
      return 220
    },
    headerShadow() {
      // Subtle drop shadow
      return { type: 'dropShadow', color: 0x33000000, blur: 8, offsetX: 0, offsetY: 2 }
    },
    focusRingShader() {
      // Rounded border using rounded rect shader effect
      return { type: 'radius', radius: 16, stroke: 2 }
    }
  },

  lifecycle: {
    // Update the clock every second
    mounted() {
      this._timer = setInterval(() => {
        this.now = this._formatTime(new Date())
      }, 1000)
    },
    destroyed() {
      if (this._timer) {
        clearInterval(this._timer)
        this._timer = null
      }
    }
  },

  methods: {
    // PUBLIC_INTERFACE
    focus() {
      /** Focus header to show ring and allow right/left actions to bubble. */
      this.focused = true
    },
    // PUBLIC_INTERFACE
    blur() {
      /** Blur header to hide ring. */
      this.focused = false
    },
    _formatTime(date) {
      const is24 = (this.timeFormat || '24h') === '24h'
      let hours = date.getHours()
      let suffix = ''
      if (!is24) {
        suffix = hours >= 12 ? ' PM' : ' AM'
        hours = hours % 12 || 12
      }
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const hh = is24 ? hours.toString().padStart(2, '0') : hours.toString()
      return `${hh}:${minutes}${suffix}`
    }
  },

  input: {
    left(e) {
      // Bubble to parent so the page can handle navigation
      if (this.parent && this.parent.focus) this.parent.focus(e)
    },
    right(e) {
      if (this.parent && this.parent.focus) this.parent.focus(e)
    },
    enter() {
      // Could open location selector, keep no-op for now
    },
    back(e) {
      if (this.parent && this.parent.focus) this.parent.focus(e)
    }
  }
})
