import Blits from '@lightningjs/blits'
import theme from '../plugins/theme.js'
import store from '../plugins/store.js'

/**
 * Settings page
 * Provides:
 *  - Units toggle: metric/imperial
 *  - Location selection: simple location search/picker
 * Integrates with global store: setUnits, setLocation, refreshWeather
 * Remote navigation: up/down to switch rows, left/right/enter to change, back to return
 */
export default Blits.Component('Settings', {
  state() {
    return {
      // focus rows: 0 = units, 1 = location input, 2 = result list
      focusRow: 0,
      // derived from store
      units: store.units,
      locationName: store.location?.name || '',
      // search state
      query: '',
      results: [],
      selectedResultIndex: 0,
      // local focus flags to drive visuals
      focusUnits: true,
      focusLocationInput: false,
      focusResults: false,
      // helper text
      help: 'Use Up/Down to move • Left/Right/Enter to change • Back to return',
    }
  },

  watchers: {
    '$store.units': {
      handler(v) { this.units = v },
      deep: false,
    },
    '$store.location': {
      handler(v) { this.locationName = v?.name || '' },
      deep: false,
    },
  },

  template: `
    <Element w="1920" h="960">
      <!-- Page Title -->
      <Element x="96" y="24" w="1728" h="96">
        <Text x="0" y="0" fontSize="64" :color="$titleColor" content="Settings" />
        <Text x="0" y="72" fontSize="28" :color="$muted" :content="$help" />
      </Element>

      <!-- Units Row -->
      <Element x="96" y="160" w="1728" h="100" :zIndex="$focusUnits ? 2 : 1">
        <Element :color="$rowBg($focusUnits)" w="1200" h="88" :shader="$radius" />
        <Text x="24" y="24" fontSize="36" :color="$text" content="Units" />
        <!-- Toggle pills -->
        <Element x="300" y="16" w="360" h="56">
          <Element
            :color="$pillBg($units === 'metric', $focusUnits)"
            w="160" h="56"
            :shader="$pillRadius"
          >
            <Text x="24" y="12" fontSize="28" :color="$pillText($units === 'metric', $focusUnits)" content="Metric" />
          </Element>
          <Element
            x="180"
            :color="$pillBg($units === 'imperial', $focusUnits)"
            w="160" h="56"
            :shader="$pillRadius"
          >
            <Text x="24" y="12" fontSize="28" :color="$pillText($units === 'imperial', $focusUnits)" content="Imperial" />
          </Element>
        </Element>
      </Element>

      <!-- Location Row -->
      <Element x="96" y="300" w="1728" h="300" :zIndex="$focusLocationInput || $focusResults ? 2 : 1">
        <Element :color="$rowBg($focusLocationInput || $focusResults)" w="1200" h="88" :shader="$radius" />
        <Text x="24" y="24" fontSize="36" :color="$text" content="Location" />
        <!-- Input-like pill -->
        <Element x="300" y="16" w="600" h="56" :color="$inputBg" :shader="$pillRadius">
          <Text x="24" y="12" fontSize="28" :color="$inputTextColor" :content="$inputContent" />
          <Element x="560" y="16" w="24" h="24" :color="$caretColor" :alpha="$focusLocationInput ? 1 : 0" />
        </Element>
        <Text x="920" y="28" fontSize="24" :color="$muted" content="Type to search (demo data)" />

        <!-- Results list -->
        <Element x="300" y="96" w="820" h="188">
          <Element
            :for="(item, index) in $results"
            :key="$item.id"
            :y="$index * 64"
            w="820" h="56"
            :color="$resultBg($index === $selectedResultIndex, $focusResults)"
            :shader="$pillRadius"
          >
            <Text x="20" y="12" fontSize="28" :color="$resultText($index === $selectedResultIndex, $focusResults)" :content="$item.name" />
          </Element>
          <Text
            :alpha="$results.length === 0 ? 1 : 0"
            x="0" y="8" fontSize="24" :color="$muted" content="No results. Try: 'San', 'New', 'Lon'"
          />
        </Element>
      </Element>

      <!-- Footer -->
      <Element x="96" y="640" w="1728" h="48">
        <Text fontSize="24" :color="$muted" content="Changes apply immediately and refresh weather" />
      </Element>
    </Element>
  `,

  computed: {
    text() { return theme.colors.text || '#111827' },
    muted() { return theme.colors.mutedText || '#4B5563' },
    titleColor() { return theme.colors.text || '#111827' },
    radius() { return { type: 'radius', radius: 16 } },
    pillRadius() { return { type: 'radius', radius: 12 } },
    inputBg() { return 0x11FFFFFF },
    inputTextColor() { return theme.colors.text || '#111827' },
    caretColor() { return theme.colors.secondary || '#F59E0B' },

    inputContent() {
      // Show query while typing; otherwise show current location name
      return this.query ? this.query : (this.locationName || 'Select a city')
    },

    rowBg() {
      return (focused) => focused ? 0x112563EB : 0x10FFFFFF
    },
    pillBg() {
      return (active, focused) => {
        if (active) {
          return focused ? (theme.colors.primary || 0xff2563EB) : 0x332563EB
        }
        return focused ? 0x112563EB : 0x10FFFFFF
      }
    },
    pillText() {
      return (active, focused) => {
        if (active) return 0xFFFFFFFF
        return focused ? (theme.colors.text || 0xff111827) : (theme.colors.text || 0xff111827)
      }
    },
    resultBg() {
      return (selected, focused) => {
        if (selected && focused) return theme.colors.secondary || 0xffF59E0B
        if (selected) return 0x22F59E0B
        return 0x10FFFFFF
      }
    },
    resultText() {
      return (selected, focused) => {
        if (selected && focused) return 0xFFFFFFFF
        return theme.colors.text || 0xff111827
      }
    },
  },

  methods: {
    // PUBLIC_INTERFACE
    applyUnits(nextUnits) {
      /** Apply units to store and refresh weather. */
      if (nextUnits !== 'metric' && nextUnits !== 'imperial') return
      if (store.units === nextUnits) return
      store.setUnits(nextUnits)
      // toast feedback
      this.$app.toast?.(`Units: ${nextUnits}`, 'info', 1200)
      // refresh using existing location if coordinates available
      store.refreshWeather?.()
    },

    // PUBLIC_INTERFACE
    focusRowIndex(idx) {
      /** Move focus to a specific row and update flags. */
      const clamped = Math.max(0, Math.min(2, idx))
      this.focusRow = clamped
      this.focusUnits = clamped === 0
      this.focusLocationInput = clamped === 1
      this.focusResults = clamped === 2
    },

    // PUBLIC_INTERFACE
    async applyLocationSelection(item) {
      /** Set store location to selected result and refresh weather. */
      if (!item) return
      store.setLocation({ name: item.name, lat: item.lat, lon: item.lon })
      this.locationName = item.name
      this.query = ''
      this.results = []
      this.selectedResultIndex = 0
      if (this.$app?.setLocation) this.$app.setLocation(item.name)
      this.$app.toast?.(`Location: ${item.name}`, 'info', 1200)
      await store.refreshWeather?.()
    },

    // PUBLIC_INTERFACE
    runSearch(q) {
      /** Demo search over a static list; replace with API integration later. */
      const data = [
        { id: 'sf', name: 'San Francisco, US', lat: 37.7749, lon: -122.4194 },
        { id: 'sj', name: 'San Jose, US', lat: 37.3382, lon: -121.8863 },
        { id: 'ny', name: 'New York, US', lat: 40.7128, lon: -74.0060 },
        { id: 'ldn', name: 'London, UK', lat: 51.5074, lon: -0.1278 },
        { id: 'par', name: 'Paris, FR', lat: 48.8566, lon: 2.3522 },
        { id: 'bom', name: 'Mumbai, IN', lat: 19.0760, lon: 72.8777 },
        { id: 'tok', name: 'Tokyo, JP', lat: 35.6762, lon: 139.6503 },
        { id: 'ber', name: 'Berlin, DE', lat: 52.5200, lon: 13.4050 },
        { id: 'syd', name: 'Sydney, AU', lat: -33.8688, lon: 151.2093 },
        { id: 'mad', name: 'Madrid, ES', lat: 40.4168, lon: -3.7038 },
      ]
      const query = (q || '').toLowerCase().trim()
      if (!query) {
        this.results = []
        this.selectedResultIndex = 0
        return
      }
      const filtered = data.filter(d => d.name.toLowerCase().includes(query)).slice(0, 6)
      this.results = filtered
      this.selectedResultIndex = 0
    },
  },

  input: {
    up() {
      // move up between rows
      if (this.focusRow > 0) {
        this.focusRowIndex(this.focusRow - 1)
      }
    },
    down() {
      // move down between rows; only go to results if they exist
      if (this.focusRow === 0) {
        this.focusRowIndex(1)
      } else if (this.focusRow === 1) {
        if (this.results.length > 0) this.focusRowIndex(2)
      }
    },
    left() {
      // adjust units or selection
      if (this.focusRow === 0) {
        // toggle to metric
        this.applyUnits('metric')
      } else if (this.focusRow === 2) {
        // treat as move up in list
        this.selectedResultIndex = Math.max(0, this.selectedResultIndex - 1)
      } else {
        // bubble if needed
        if (this.parent && this.parent.focus) this.parent.focus()
      }
    },
    right() {
      if (this.focusRow === 0) {
        // toggle to imperial
        this.applyUnits('imperial')
      } else if (this.focusRow === 2) {
        // treat as move down in list
        this.selectedResultIndex = Math.min(Math.max(0, this.results.length - 1), this.selectedResultIndex + 1)
      } else {
        if (this.parent && this.parent.focus) this.parent.focus()
      }
    },
    enter() {
      // Perform action based on focus row
      if (this.focusRow === 0) {
        // toggle units
        const next = this.units === 'metric' ? 'imperial' : 'metric'
        this.applyUnits(next)
      } else if (this.focusRow === 1) {
        // if we have query and results, jump to results
        if (this.results.length > 0) this.focusRowIndex(2)
      } else if (this.focusRow === 2) {
        const item = this.results[this.selectedResultIndex]
        if (item) this.applyLocationSelection(item)
      }
    },
    back() {
      this.$router.back()
    },

    // Text input simulation for demo search: map key labels into query string
    // Note: In Lightning on TV you usually have an on-screen keyboard. For this demo we accept A-Z and space from a keyboard.
    key(e) {
      // e could carry key value depending on integration; as a safe fallback use global lastKey if present
      const k = (e && (e.key || e.code)) || ''
      if (this.focusRow !== 1) return
      if (!k) return
      // Handle character inputs
      if (/^Key[A-Z]$/.test(k)) {
        const ch = k.replace('Key', '')
        this.query += ch
        this.runSearch(this.query)
      } else if (k === 'Space') {
        this.query += ' '
        this.runSearch(this.query)
      } else if (k === 'Backspace') {
        this.query = this.query.slice(0, -1)
        this.runSearch(this.query)
      }
    },
  },

  lifecycle: {
    mounted() {
      // Initialize visual focus
      this.focusRowIndex(0)
    },
  },
})
