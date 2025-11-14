import Blits from '@lightningjs/blits'

/**
 * Global Weather Store Plugin
 * Centralized state and actions for managing weather data across the app.
 * Exposes a store that components/pages can import and use directly.
 *
 * State fields:
 * - location: { name: string, lat: number|null, lon: number|null }
 * - units: 'metric' | 'imperial'
 * - current: object|null
 * - hourly: array
 * - daily: array
 * - loading: boolean
 * - error: string|null
 * - lastUpdated: number|null (timestamp ms)
 *
 * Methods:
 * - setLocation({ name, lat, lon })
 * - setUnits(units)
 * - setLoading(isLoading)
 * - setError(message)
 * - setWeatherData({ current, hourly, daily, lastUpdated? })
 * - refreshWeather() -> fetches latest weather using services/api.js (stubbed here)
 *
 * Usage:
 *   import store from '../plugins/store.js'
 *   // read
 *   const name = store.location.name
 *   // write
 *   store.setUnits('imperial')
 *   // trigger refresh
 *   await store.refreshWeather()
 */

// Create a Blits plugin store for reactivity across components
const store = Blits.Plugin('WeatherStore', {
  // Reactive state
  state() {
    return {
      location: {
        name: 'My Location',
        lat: null,
        lon: null,
      },
      units: 'metric',
      current: null,
      hourly: [],
      daily: [],
      loading: false,
      error: null,
      lastUpdated: null,
    }
  },

  // PUBLIC actions/methods to mutate state
  methods: {
    // PUBLIC_INTERFACE
    setLocation(loc) {
      /** Update the selected location. Expects { name, lat, lon }. */
      const safe = {
        name: typeof loc?.name === 'string' ? loc.name : 'Unknown',
        lat: typeof loc?.lat === 'number' ? loc.lat : null,
        lon: typeof loc?.lon === 'number' ? loc.lon : null,
      }
      this.location = safe
    },

    // PUBLIC_INTERFACE
    setUnits(units) {
      /** Set measurement units. Accepts 'metric' or 'imperial'. */
      if (units !== 'metric' && units !== 'imperial') {
        // ignore invalid values
        return
      }
      this.units = units
    },

    // PUBLIC_INTERFACE
    setLoading(isLoading) {
      /** Toggle loading state. */
      this.loading = !!isLoading
    },

    // PUBLIC_INTERFACE
    setError(message) {
      /** Set error message (string or null). */
      this.error = message || null
    },

    // PUBLIC_INTERFACE
    setWeatherData(payload) {
      /** Update weather data slices atomically. */
      const { current, hourly, daily, lastUpdated } = payload || {}
      if (current !== undefined) this.current = current
      if (hourly !== undefined) this.hourly = Array.isArray(hourly) ? hourly : []
      if (daily !== undefined) this.daily = Array.isArray(daily) ? daily : []
      this.lastUpdated = typeof lastUpdated === 'number' ? lastUpdated : Date.now()
    },

    // PUBLIC_INTERFACE
    async refreshWeather() {
      /**
       * Fetch latest weather for current location and units.
       * This is stubbed to avoid runtime errors until services/api.js is implemented.
       *
       * Expected implementation later:
       *   import { getWeather } from '../services/api.js'
       *   const data = await getWeather(this.location, this.units)
       *   this.setWeatherData(data)
       */
      try {
        this.setLoading(true)
        this.setError(null)

        // Validate location before attempting fetch
        const { lat, lon } = this.location || {}
        if (typeof lat !== 'number' || typeof lon !== 'number') {
          throw new Error('Location coordinates not set')
        }

        // STUB: simulate async call and dummy data
        await new Promise((res) => setTimeout(res, 150))
        const fakeCurrent = {
          temp: this.units === 'metric' ? 20 : 68,
          summary: 'Partly Cloudy',
          icon: 'partly-cloudy',
        }
        const fakeHourly = Array.from({ length: 12 }).map((_, i) => ({
          id: `h${i}`,
          hour: i,
          temp: this.units === 'metric' ? 18 + i * 0.3 : 64 + i * 0.5,
          icon: 'cloud',
        }))
        const fakeDaily = Array.from({ length: 7 }).map((_, i) => ({
          id: `d${i}`,
          day: i,
          high: this.units === 'metric' ? 24 + i * 0.2 : 75 + i * 0.3,
          low: this.units === 'metric' ? 14 + i * 0.2 : 57 + i * 0.3,
          icon: 'sun',
        }))

        this.setWeatherData({
          current: fakeCurrent,
          hourly: fakeHourly,
          daily: fakeDaily,
        })
      } catch (err) {
        this.setError(err?.message || 'Failed to refresh weather')
      } finally {
        this.setLoading(false)
      }
    },
  },
})

/**
 * Helper exports so consumers may either:
 * - import default store to access state/actions
 * - or import named actions for convenience
 */

// Named action exports
// PUBLIC_INTERFACE
function setLocation(loc) {
  /** Proxy to store.setLocation */
  return store.setLocation(loc)
}
// PUBLIC_INTERFACE
function setUnits(units) {
  /** Proxy to store.setUnits */
  return store.setUnits(units)
}
// PUBLIC_INTERFACE
function setLoading(isLoading) {
  /** Proxy to store.setLoading */
  return store.setLoading(isLoading)
}
// PUBLIC_INTERFACE
function setError(message) {
  /** Proxy to store.setError */
  return store.setError(message)
}
// PUBLIC_INTERFACE
function setWeatherData(payload) {
  /** Proxy to store.setWeatherData */
  return store.setWeatherData(payload)
}
// PUBLIC_INTERFACE
async function refreshWeather() {
  /** Proxy to store.refreshWeather */
  return store.refreshWeather()
}

export {
  setLocation,
  setUnits,
  setLoading,
  setError,
  setWeatherData,
  refreshWeather,
}

// Default export for direct usage
export default store
