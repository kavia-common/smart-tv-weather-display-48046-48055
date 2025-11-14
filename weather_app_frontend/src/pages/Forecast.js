import Blits from '@lightningjs/blits'
import ForecastList from '../components/ForecastList.js'
import store from '../plugins/store.js'
import { formatTemp, formatTime, formatDate, mapConditionToIcon } from '../utils/format.js'

/**
 * Forecast page
 * Shows hourly/daily forecast with remote-friendly navigation and toggle.
 */
export default Blits.Component('Forecast', {
  components: { ForecastList },

  props: [],

  state() {
    return {
      // 'hourly' | 'daily'
      mode: 'hourly',
      // index tracking across modes to restore selection when toggling
      selectedIndexHourly: 0,
      selectedIndexDaily: 0,
      detail: null, // selected item details preview
      // bind store slices for reactivity
      hourly: store.hourly,
      daily: store.daily,
      units: store.units,
      loading: store.loading,
      error: store.error,
      locationName: store.location?.name || '',
    }
  },

  computed: {
    palette() {
      const themeData = this.$theme?.colors || {}
      return {
        background: themeData.background ?? 0xFF0B0B0B,
        surface: themeData.surface ?? 0xFF111827,
        primary: themeData.primary ?? 0xFF2563EB,
        secondary: themeData.secondary ?? 0xFFF59E0B,
        text: themeData.text ?? 0xFFFFFFFF,
        subtle: 0xFF9CA3AF,
      }
    },

    // Display data mapped to ForecastItem shape
    listItems() {
      if (this.mode === 'hourly') {
        return (this.hourly || []).map((h, i) => {
          // Accepts either already formatted objects or raw API-like records
          const id = h.id ?? `h${i}`
          const when = h.ts ?? h.time ?? h.hour ?? i
          const ts = typeof when === 'number' && when > 10000 ? when : Date.now() + i * 3600000
          const icon = h.icon ? this.iconPath(h.icon) : this.iconPath(mapConditionToIcon(h.weather || {}))
          const temp = h.temp ?? h.temperature ?? h.t ?? null
          return {
            id,
            title: formatTime(ts),
            subtitle: h.summary || h.description || '',
            icon,
            temp: formatTemp(temp, this.units),
            meta: h.pop !== undefined ? `${Math.round(h.pop * 100)}%` : '',
            raw: h,
          }
        })
      }
      // daily
      return (this.daily || []).map((d, i) => {
        const id = d.id ?? `d${i}`
        const when = d.ts ?? d.time ?? d.day ?? i
        const ts = typeof when === 'number' && when > 10000 ? when : Date.now() + i * 86400000
        const icon = d.icon ? this.iconPath(d.icon) : this.iconPath(mapConditionToIcon(d.weather || {}))
        const hi = d.high ?? d.max ?? d.temp_max ?? null
        const lo = d.low ?? d.min ?? d.temp_min ?? null
        const tempLabel = hi !== null && lo !== null
          ? `${formatTemp(hi, this.units)}/${formatTemp(lo, this.units)}`
          : (hi !== null ? formatTemp(hi, this.units) : (lo !== null ? formatTemp(lo, this.units) : ''))
        return {
          id,
          title: formatDate(ts),
          subtitle: d.summary || d.description || '',
          icon,
          temp: tempLabel,
          meta: d.pop !== undefined ? `${Math.round(d.pop * 100)}%` : '',
          raw: d,
        }
      })
    },

    sectionTitle() {
      return this.mode === 'hourly' ? 'Next Hours' : 'Next Days'
    },

    // Keep selection index per mode
    selectedIndex: {
      get() {
        return this.mode === 'hourly' ? this.selectedIndexHourly : this.selectedIndexDaily
      },
      set(v) {
        if (this.mode === 'hourly') this.selectedIndexHourly = v
        else this.selectedIndexDaily = v
      }
    },

    // Details panel content from selection
    selectedItem() {
      const items = this.listItems
      if (!items || !items.length) return null
      return items[this.selectedIndex] || items[0]
    },
  },

  watchers: {
    // reflect store updates into local state
    '$store.hourly': {
      handler(v) { this.hourly = v },
      deep: false,
    },
    '$store.daily': {
      handler(v) { this.daily = v },
      deep: false,
    },
    '$store.units': {
      handler(v) { this.units = v },
      deep: false,
    },
    '$store.loading': {
      handler(v) { this.loading = v },
      deep: false,
    },
    '$store.error': {
      handler(v) { this.error = v },
      deep: false,
    },
    '$store.location': {
      handler(v) { this.locationName = v?.name || '' },
      deep: false,
    },
    // Update detail preview when selection changes
    selectedIndex() {
      this.updateDetail()
    },
    mode() {
      this.updateDetail()
    }
  },

  template: `
    <Element w="1920" h="960">
      <!-- Header line -->
      <Element x="96" y="24" w="1728" h="72">
        <Text x="0" y="0" fontSize="56" :color="$palette.text" content="Forecast" />
        <Text x="0" y="64" fontSize="28" :color="$palette.subtle" :content="$locationName ? $locationName : ''" />
      </Element>

      <!-- Toggle buttons -->
      <Element x="96" y="128" w="600" h="60">
        <Element :color="$mode === 'hourly' ? $palette.primary : $palette.surface" rect="true" w="200" h="56" rtt="true">
          <Text x="24" y="12" fontSize="32" :color="$mode === 'hourly' ? 0xFFFFFFFF : $palette.text" content="Hourly" />
        </Element>
        <Element x="220" :color="$mode === 'daily' ? $palette.primary : $palette.surface" rect="true" w="200" h="56" rtt="true">
          <Text x="24" y="12" fontSize="32" :color="$mode === 'daily' ? 0xFFFFFFFF : $palette.text" content="Daily" />
        </Element>
        <Text x="460" y="12" fontSize="24" :color="$palette.subtle" content="Use Left/Right to change, Enter to select" />
      </Element>

      <!-- List and details -->
      <Element x="96" y="208" w="1728" h="680">
        <!-- Forecast horizontal list -->
        <ForecastList
          ref="list"
          :items="$listItems"
          :itemWidth="300"
          :itemHeight="320"
          :spacing="28"
          :initialIndex="$selectedIndex"
          :onChange="$onListChange"
          :onEnter="$onListEnter"
          :title="$sectionTitle"
          :theme="$theme"
        />

        <!-- Detail panel -->
        <Element x="0" y="360" w="1728" h="300" :color="$palette.surface" rect="true" rtt="true">
          <Text x="24" y="24" fontSize="28" :color="$palette.subtle" content="Details" />
          <Text x="24" y="72" fontSize="40" :color="$palette.text" :content="$selectedItem ? $selectedItem.title : ''" />
          <Text x="24" y="128" fontSize="28" :color="$palette.text" :content="$selectedItem ? ($selectedItem.subtitle || '') : ''" />
          <Text x="24" y="172" fontSize="28" :color="$palette.secondary" :content="$selectedItem ? ($selectedItem.temp || '') : ''" />
          <Text x="24" y="216" fontSize="24" :color="$palette.subtle" :content="$detail ? $detail : ''" />
        </Element>
      </Element>

      <!-- Footer help -->
      <Element x="96" y="900" w="1728" h="48">
        <Text fontSize="24" :color="$palette.subtle" content="Back: return to Home • Up/Down: switch section focus • Left/Right: navigate items" />
      </Element>
    </Element>
  `,

  lifecycle: {
    mounted() {
      // Ensure selection and details are in sync
      this.updateDetail()
      // If no data present, try to refresh (will be stubbed)
      if (!Array.isArray(this.hourly) || this.hourly.length === 0) {
        // Do not await to keep UX responsive
        store.refreshWeather?.()
      }
    }
  },

  methods: {
    // PUBLIC_INTERFACE
    switchMode(nextMode) {
      /** Switch between 'hourly' and 'daily' modes. */
      if (nextMode !== 'hourly' && nextMode !== 'daily') return
      this.mode = nextMode
      // After mode switch, try to focus previously selected index
      this.$refs?.list?.focusIndex?.(this.selectedIndex)
    },

    // PUBLIC_INTERFACE
    toggleMode() {
      /** Convenience toggle between hourly and daily. */
      this.switchMode(this.mode === 'hourly' ? 'daily' : 'hourly')
    },

    // PUBLIC_INTERFACE
    onListChange(index, item) {
      /** Handle list index change and persist per-mode index. */
      this.selectedIndex = index
      this.updateDetail(item)
    },

    // PUBLIC_INTERFACE
    onListEnter(item) {
      /** Optional: show a toast or perform action on enter of item. */
      const msg = this.mode === 'hourly'
        ? `Hour: ${item?.title} • ${item?.temp || ''}`
        : `Day: ${item?.title} • ${item?.temp || ''}`
      this.$app.toast?.(msg, 'info', 2000)
    },

    iconPath(token) {
      // For now, return a placeholder asset path; users should place icons in /public/assets
      // Enforce rule to reference without 'public/' prefix.
      // Example tokens: 'cloud', 'rain', 'clear-day'
      return `/assets/icons/${token}.png`
    },

    updateDetail(passedItem) {
      const it = passedItem || this.selectedItem
      if (!it) {
        this.detail = ''
        return
      }
      // Build a small descriptive line from raw data where possible
      const raw = it.raw || {}
      const wind = raw.wind !== undefined ? raw.wind : raw.wind_speed
      const hum = raw.humidity
      const parts = []
      if (wind !== undefined) parts.push(`Wind: ${wind}`)
      if (hum !== undefined) parts.push(`Humidity: ${hum}%`)
      if (raw.uvi !== undefined) parts.push(`UV: ${raw.uvi}`)
      this.detail = parts.join(' • ')
    },
  },

  input: {
    left() {
      // If near toggle area and at first item, change to hourly
      if (this.mode === 'daily') {
        // If list is at index 0 and user presses left again, switch mode
        if (this.selectedIndex === 0) {
          this.switchMode('hourly')
          return
        }
      }
      // delegate to list
      this.$refs?.list?.input?.left?.()
    },
    right() {
      if (this.mode === 'hourly') {
        // If list at end and user presses right again, switch to daily
        const len = this.listItems?.length ?? 0
        if (len && this.selectedIndex === len - 1) {
          this.switchMode('daily')
          return
        }
      }
      this.$refs?.list?.input?.right?.()
    },
    up() {
      // No-op to keep list focus
    },
    down() {
      // No-op; detail panel does not hold focus
    },
    enter() {
      // Forward to list
      this.$refs?.list?.input?.enter?.()
    },
    back() {
      // Navigate back to Home
      this.$router.to('/')
    }
  }
})
