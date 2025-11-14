import Blits from '@lightningjs/blits'
import theme from '../plugins/theme'
import store from '../plugins/store'
import { formatTemp, formatWind } from '../utils/format'

/**
 * WeatherNow component
 * Renders the current weather conditions: large temperature, condition text, icon, feels-like, humidity, and wind.
 * Uses theme tokens, reacts to store state (current, units), supports focus outline and transitions,
 * and navigates to '/forecast' on enter.
 */
export default Blits.Component('WeatherNow', {
  state() {
    return {
      // Local visual state for hover/focus transitions
      focused: false,
      // Mirror of store state slices
      current: store.state.weather?.current || null,
      units: store.state.settings?.units || 'metric',
    }
  },

  // Subscribe to global store updates
  created() {
    // Keep local reactive state in sync with store
    this._unsubscribe = store.subscribe(() => {
      this.current = store.state.weather?.current || null
      this.units = store.state.settings?.units || 'metric'
    })
  },

  destroyed() {
    if (this._unsubscribe) this._unsubscribe()
  },

  components: {},

  template: `
    <Element
      w="900"
      h="520"
      :x="(1920 - 900) / 2"
      :y="140"
      :scale="$focused ? 1.02 : 1.0"
      :alpha="$focused ? 1.0 : 0.98"
    >
      <!-- Panel background -->
      <Element
        w="900"
        h="520"
        :color="$panelBg"
        r="24"
        zIndex="0"
      />
      <!-- Focus outline -->
      <Element
        w="900"
        h="520"
        r="28"
        :alpha="$focused ? 1 : 0"
        :color="$focusOutline"
        zIndex="1"
      />

      <!-- Content wrapper -->
      <Element x="40" y="40" zIndex="2">
        <!-- Top row: Icon + Main temperature and condition -->
        <Element>
          <!-- Weather Icon -->
          <Element
            :x="0"
            :y="0"
            w="180"
            h="180"
            :src="$iconSrc"
          />
          <!-- Temp and condition -->
          <Element x="220" y="10">
            <Text
              :content="$mainTemp"
              :color="$textPrimary"
              fontSize="120"
              fontFace="Regular"
            />
            <Text
              y="130"
              :content="$conditionText"
              :color="$textSecondary"
              fontSize="36"
              fontFace="Regular"
            />
          </Element>
        </Element>

        <!-- Bottom row: feels like, humidity, wind -->
        <Element y="260">
          <Element>
            <Text
              :content="$feelsLikeText"
              :color="$textSecondary"
              fontSize="32"
              fontFace="Regular"
            />
          </Element>
          <Element x="300">
            <Text
              :content="$humidityText"
              :color="$textSecondary"
              fontSize="32"
              fontFace="Regular"
            />
          </Element>
          <Element x="560">
            <Text
              :content="$windText"
              :color="$textSecondary"
              fontSize="32"
              fontFace="Regular"
            />
          </Element>
        </Element>
      </Element>
    </Element>
  `,

  computed: {
    // Theme tokens (pull from theme plugin)
    panelBg() {
      // Slightly translucent surface for depth
      return theme.color('surface', 0.98)
    },
    focusOutline() {
      // Use secondary as focus ring
      return theme.color('secondary')
    },
    textPrimary() {
      return theme.color('text')
    },
    textSecondary() {
      // Subtle secondary text
      return theme.color('text', 0.75)
    },

    // Data bindings
    mainTemp() {
      if (!this.current) return '--°'
      return formatTemp(this.current.temp, this.units)
    },
    conditionText() {
      return this.current?.condition || '—'
    },
    feelsLikeText() {
      if (!this.current) return 'Feels like —'
      const t = formatTemp(this.current.feels_like, this.units)
      return `Feels like ${t}`
    },
    humidityText() {
      if (!this.current || this.current.humidity == null) return 'Humidity —'
      return `Humidity ${Math.round(this.current.humidity)}%`
    },
    windText() {
      if (!this.current) return 'Wind —'
      return `Wind ${formatWind(this.current.wind_speed, this.current.wind_deg, this.units)}`
    },
    iconSrc() {
      // Map a condition code or string to an asset path.
      // Expecting current.icon to be something like '01d', 'rain', etc.
      const iconKey = (this.current?.icon || '').toString().toLowerCase()
      // Basic mapping; assets must exist in public/assets/ if used.
      const mapping = {
        '01d': 'assets/weather/clear-day.png',
        '01n': 'assets/weather/clear-night.png',
        '02d': 'assets/weather/partly-cloudy-day.png',
        '02n': 'assets/weather/partly-cloudy-night.png',
        '03d': 'assets/weather/cloudy.png',
        '03n': 'assets/weather/cloudy.png',
        '04d': 'assets/weather/overcast.png',
        '04n': 'assets/weather/overcast.png',
        '09d': 'assets/weather/rain.png',
        '09n': 'assets/weather/rain.png',
        '10d': 'assets/weather/rain.png',
        '10n': 'assets/weather/rain.png',
        '11d': 'assets/weather/thunder.png',
        '11n': 'assets/weather/thunder.png',
        '13d': 'assets/weather/snow.png',
        '13n': 'assets/weather/snow.png',
        '50d': 'assets/weather/mist.png',
        '50n': 'assets/weather/mist.png',
        // Fallbacks for textual types
        'clear': 'assets/weather/clear-day.png',
        'rain': 'assets/weather/rain.png',
        'snow': 'assets/weather/snow.png',
        'clouds': 'assets/weather/cloudy.png',
        'thunderstorm': 'assets/weather/thunder.png',
        'mist': 'assets/weather/mist.png',
        'fog': 'assets/weather/mist.png'
      }
      return mapping[iconKey] || 'assets/weather/unknown.png'
    }
  },

  methods: {
    // PUBLIC_INTERFACE
    focus(e) {
      /** Set focused state and allow parent to manage focus chain. */
      this.focused = true
      return true
    },
    // PUBLIC_INTERFACE
    unfocus(e) {
      /** Remove focused visual state. */
      this.focused = false
      return true
    }
  },

  input: {
    up() {},
    down() {},
    left() {},
    right() {},
    enter() {
      // Navigate to forecast page
      this.$router.to('/forecast')
    },
    back() {
      // Bubble back if needed
      this.parent && this.parent.focus && this.parent.focus()
    }
  }
})
