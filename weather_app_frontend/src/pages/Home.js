import Blits from '@lightningjs/blits'
import Panel from '../components/Panel.js'
import WeatherNow from '../components/WeatherNow.js'
import ForecastList from '../components/ForecastList.js'
import store from '../plugins/store.js'
import theme from '../plugins/theme.js'

/**
 * Home page
 * Layout:
 *  - Header is rendered globally by App at y=0..120
 *  - Content area (this page) at y=0..960 within App's content slot
 *  - Left: WeatherNow card
 *  - Right: Forecast panel with a horizontal list
 *
 * Behaviors:
 *  - On mount: if data is missing or stale (>10 min), call store.refreshWeather()
 *  - Focus traversal: WeatherNow <-> Forecast panel with left/right
 *  - Enter navigates to '/forecast'
 *  - On store error, show global Toast
 */
export default Blits.Component('Home', {
  components: { Panel, WeatherNow, ForecastList },

  state() {
    return {
      focusedSection: 'now', // 'now' | 'forecast'
      // mirror essential slices for reactive bindings
      current: store.current,
      daily: store.daily || [],
      error: store.error,
      loading: store.loading,
      lastUpdated: store.lastUpdated,
      // basic geometry
      layout: {
        pad: 48,
        gap: 32,
        headerH: 0, // App already offset page by 120
        contentH: 960,
        leftW: 940,
        rightW: 1920 - 48 - 32 - 940 - 48, // full width - paddings - gap - leftW
      },
    }
  },

  created() {
    // keep local state in sync with global store
    this._unsub = store.subscribe(() => {
      this.current = store.current
      this.daily = store.daily
      this.error = store.error
      this.loading = store.loading
      this.lastUpdated = store.lastUpdated
      // Show toast for API errors
      if (this.error && this.$app && this.$app.toast) {
        this.$app.toast(this.error, 'error', 3000)
      }
    })
  },

  destroyed() {
    if (this._unsub) this._unsub()
  },

  template: `
    <Element w="1920" h="960">
      <!-- Left: Weather Now -->
      <Element :x="$layout.pad" :y="$layout.pad" :w="$layout.leftW" :h="$layout.contentH - ($layout.pad * 2)">
        <WeatherNow ref="now" />
        <!-- Tip -->
        <Text
          :x="0"
          :y="$layout.contentH - ($layout.pad * 2) - 40"
          :content="$loading ? 'Refreshing weather…' : 'Press Enter to view full forecast'"
          :color="$tipColor"
          fontSize="28"
        />
      </Element>

      <!-- Right: Forecast Panel -->
      <Panel
        :x="$layout.pad + $layout.leftW + $layout.gap"
        :y="$layout.pad"
        :w="$layout.rightW"
        :h="$layout.contentH - ($layout.pad * 2)"
        header="Next Days"
        elevated="true"
        ref="forecastPanel"
      >
        <ForecastList
          :items="$dailyItems"
          :itemWidth="260"
          :itemHeight="300"
          :spacing="28"
          :title="'7-day forecast'"
          :onEnter="$goForecast"
        />
        <!-- Error/Empty states -->
        <Text
          x="0" y="0"
          :alpha="$showEmpty ? 1 : 0"
          :content="$emptyText"
          :color="$mutedText"
          fontSize="28"
        />
      </Panel>
    </Element>
  `,

  computed: {
    mutedText() {
      return theme.colors.mutedText || '#4B5563'
    },
    tipColor() {
      return theme.colors.secondary || '#F59E0B'
    },
    showEmpty() {
      return !this.loading && (!Array.isArray(this.daily) || this.daily.length === 0)
    },
    emptyText() {
      return this.error ? 'Unable to load forecast' : 'No forecast data'
    },
    // Map store.daily into simple items for ForecastList
    dailyItems() {
      const arr = Array.isArray(this.daily) ? this.daily : []
      return arr.map((d, i) => ({
        id: `d-${d.date || i}`,
        title: this._formatDay(d.date),
        subtitle: d.condition || '—',
        icon: d.icon || 'unknown',
        temp: {
          min: d.temp_min,
          max: d.temp_max,
          units: d.units,
        },
        meta: d,
      }))
    },
  },

  lifecycle: {
    async mounted() {
      // initial location (for demo) if coords missing
      if (store.location?.lat == null || store.location?.lon == null) {
        store.setLocation({ name: 'San Francisco, CA', lat: 37.7749, lon: -122.4194 })
        if (this.$app?.setLocation) {
          this.$app.setLocation('San Francisco, CA')
        }
      }

      // Check staleness: 10 minutes
      const staleMs = 10 * 60 * 1000
      const now = Date.now()
      const missingCurrent = !store.current
      const missingDaily = !Array.isArray(store.daily) || store.daily.length === 0
      const stale = !store.lastUpdated || now - store.lastUpdated > staleMs

      if (missingCurrent || missingDaily || stale) {
        try {
          await store.refreshWeather()
          if (!store.error && this.$app?.toast) {
            this.$app.toast('Weather updated', 'info', 1500)
          }
        } catch (e) {
          // store handles error setting; toast via subscriber
        }
      }

      // Focus default section
      this.focusSection('now')
    },
  },

  methods: {
    // PUBLIC_INTERFACE
    focusSection(section) {
      /** Focus a logical section: 'now' or 'forecast'. */
      this.focusedSection = section
      if (section === 'now' && this.$refs.now?.focus) {
        this.$refs.now.focus()
        if (this.$refs.forecastPanel?.blur) this.$refs.forecastPanel.blur()
      } else if (section === 'forecast' && this.$refs.forecastPanel?.focus) {
        this.$refs.forecastPanel.focus()
        if (this.$refs.now?.unfocus) this.$refs.now.unfocus()
      }
    },

    // PUBLIC_INTERFACE
    goForecast() {
      /** Navigate to the forecast page. */
      this.$router.to('/forecast')
    },

    _formatDay(ts) {
      if (!ts) return '—'
      const d = new Date(ts)
      return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    },
  },

  input: {
    left() {
      // move focus to left section
      this.focusSection('now')
    },
    right() {
      // move focus to right section
      this.focusSection('forecast')
    },
    up(e) {
      // bubble up to header (rendered by App)
      if (this.parent && this.parent.focus) this.parent.focus(e)
    },
    down() {
      // no-op or future bottom dock
    },
    enter() {
      // navigate to forecast regardless of which section is focused
      this.goForecast()
    },
    back() {
      // At home, maybe show toast or ignore
      if (this.$app?.toast) this.$app.toast('Already at Home', 'info', 1200)
    },
  },
})
