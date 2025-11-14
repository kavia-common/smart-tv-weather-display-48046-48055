import { mapConditionToIcon } from '../utils/format.js'

/**
 * Weather API client with provider-based fetching and normalization.
 * Reads configuration from Vite env variables:
 * - VITE_API_BASE: optional base URL for proxied API calls
 * - VITE_WEATHER_API_KEY: API key for weather provider
 *
 * Currently supports 'openweather' provider by default.
 */

// Environment configuration (Vite exposes import.meta.env.* at build/runtime)
const {
  VITE_API_BASE,
  VITE_WEATHER_API_KEY,
  VITE_LOG_LEVEL,
} = import.meta.env

// Default provider. Future extension could add other providers here.
const DEFAULT_PROVIDER = 'openweather'

// Basic retry configuration
const RETRY_COUNT = 2
const RETRY_DELAY_MS = 450

// Units mapping for OpenWeather
const OPENWEATHER_UNITS = {
  standard: 'standard',
  metric: 'metric',
  imperial: 'imperial',
}

/**
 * Sleep helper for retry delays
 * @param {number} ms milliseconds
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Construct URL for OpenWeather API.
 * Uses either direct OpenWeather endpoint or proxied VITE_API_BASE if provided.
 * @param {string} path path after base
 * @param {Record<string,string|number>} params query params
 */
function buildOpenWeatherUrl(path, params = {}) {
  const base =
    VITE_API_BASE && VITE_API_BASE.trim().length
      ? VITE_API_BASE.replace(/\/+$/, '')
      : 'https://api.openweathermap.org/data/2.5'

  const url = new URL(`${base}/${path.replace(/^\/+/, '')}`)

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}`.length) {
      url.searchParams.set(k, `${v}`)
    }
  })

  // Only add appid if we are calling OpenWeather directly or the proxy expects it
  if (VITE_WEATHER_API_KEY) {
    // Many proxies forward this query param; safe to include
    url.searchParams.set('appid', VITE_WEATHER_API_KEY)
  }

  return url.toString()
}

/**
 * Perform fetch with retries for transient errors.
 * @param {string} url
 * @param {RequestInit} options
 */
async function fetchWithRetry(url, options = {}) {
  let lastError = null
  for (let attempt = 0; attempt <= RETRY_COUNT; attempt++) {
    try {
      const res = await fetch(url, { ...options })
      if (!res.ok) {
        // 5xx and some 429 are retriable
        if ((res.status >= 500 || res.status === 429) && attempt < RETRY_COUNT) {
          if (VITE_LOG_LEVEL !== 'silent') {
            // eslint-disable-next-line no-console
            console.warn(
              `Weather API: HTTP ${res.status}, retrying ${attempt + 1}/${RETRY_COUNT}`,
            )
          }
          await sleep(RETRY_DELAY_MS * (attempt + 1))
          continue
        }
        const text = await res.text().catch(() => '')
        throw new Error(`Weather API error ${res.status}: ${text || 'No details'}`)
      }
      return res.json()
    } catch (err) {
      lastError = err
      if (attempt < RETRY_COUNT) {
        if (VITE_LOG_LEVEL !== 'silent') {
          // eslint-disable-next-line no-console
          console.warn(
            `Weather API fetch failed (attempt ${attempt + 1}/${RETRY_COUNT}): ${err?.message || err}`,
          )
        }
        await sleep(RETRY_DELAY_MS * (attempt + 1))
        continue
      }
      break
    }
  }
  throw lastError || new Error('Weather API: unknown error')
}

/**
 * Normalize current weather response to the app's schema.
 * Target shape:
 * {
 *   temp, feels_like, condition, icon,
 *   humidity, wind, precip, sunrise, sunset
 * }
 * For OpenWeather:
 * - temp units depend on "units"
 * - wind is m/s (metric/standard) or mph (imperial) based on units param
 */
function normalizeCurrentOpenWeather(data, units = 'metric') {
  const main = data?.main || {}
  const weather0 = (data?.weather && data.weather[0]) || {}
  const sys = data?.sys || {}
  const wind = data?.wind || {}
  const rain = data?.rain || {}
  const snow = data?.snow || {}

  // Precipitation: OpenWeather may return rain/snow as { "1h": value }
  const precip =
    (typeof rain['1h'] === 'number' ? rain['1h'] : 0) +
    (typeof snow['1h'] === 'number' ? snow['1h'] : 0)

  const iconCode = weather0?.icon || ''
  const mappedIcon = mapConditionToIcon({
    id: weather0?.id,
    main: weather0?.main,
    description: weather0?.description,
    icon: iconCode,
  })

  return {
    temp: main.temp ?? null,
    feels_like: main.feels_like ?? null,
    condition: weather0?.main || 'Unknown',
    icon: mappedIcon,
    humidity: main.humidity ?? null,
    wind: typeof wind.speed === 'number' ? wind.speed : null,
    precip,
    sunrise: typeof sys.sunrise === 'number' ? sys.sunrise * 1000 : null,
    sunset: typeof sys.sunset === 'number' ? sys.sunset * 1000 : null,
    units, // carry units through for downstream formatting if needed
  }
}

/**
 * Normalize forecast (5 day / 3 hour) into hourly and daily arrays
 * Each hourly item: { time, temp, condition, icon, precip, wind, humidity }
 * Each daily item (aggregated): { date, temp_min, temp_max, condition, icon }
 */
function normalizeForecastOpenWeather(data, units = 'metric') {
  const list = Array.isArray(data?.list) ? data.list : []

  const hourly = list.map((item) => {
    const weather0 = (item?.weather && item.weather[0]) || {}
    const wind = item?.wind || {}
    const main = item?.main || {}
    const rain = item?.rain || {}
    const snow = item?.snow || {}

    const precip =
      (typeof rain['1h'] === 'number' ? rain['1h'] : 0) +
      (typeof snow['1h'] === 'number' ? snow['1h'] : 0) +
      (typeof rain['3h'] === 'number' ? rain['3h'] : 0) +
      (typeof snow['3h'] === 'number' ? snow['3h'] : 0)

    const iconCode = weather0?.icon || ''
    const mappedIcon = mapConditionToIcon({
      id: weather0?.id,
      main: weather0?.main,
      description: weather0?.description,
      icon: iconCode,
    })

    return {
      time: typeof item?.dt === 'number' ? item.dt * 1000 : null,
      temp: main.temp ?? null,
      condition: weather0?.main || 'Unknown',
      icon: mappedIcon,
      precip,
      wind: typeof wind.speed === 'number' ? wind.speed : null,
      humidity: main.humidity ?? null,
      units,
    }
  })

  // Aggregate into daily summaries by date key
  const byDate = new Map()
  hourly.forEach((h) => {
    if (!h.time) return
    const d = new Date(h.time)
    // Use local date aggregation
    const key = `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`

    const entry = byDate.get(key) || {
      date: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
      temp_min: Number.POSITIVE_INFINITY,
      temp_max: Number.NEGATIVE_INFINITY,
      count: 0,
      conditionScores: {}, // track most frequent main condition
      sampleIcon: h.icon,
      units,
    }

    if (typeof h.temp === 'number') {
      entry.temp_min = Math.min(entry.temp_min, h.temp)
      entry.temp_max = Math.max(entry.temp_max, h.temp)
    }

    const cond = h.condition || 'Unknown'
    entry.conditionScores[cond] = (entry.conditionScores[cond] || 0) + 1

    entry.count += 1
    if (!entry.sampleIcon && h.icon) entry.sampleIcon = h.icon

    byDate.set(key, entry)
  })

  const daily = Array.from(byDate.values())
    .map((d) => {
      // Determine dominant condition
      let dominant = 'Unknown'
      let bestScore = -1
      Object.entries(d.conditionScores).forEach(([cond, score]) => {
        if (score > bestScore) {
          dominant = cond
          bestScore = score
        }
      })
      return {
        date: d.date,
        temp_min: d.count > 0 && Number.isFinite(d.temp_min) ? d.temp_min : null,
        temp_max: d.count > 0 && Number.isFinite(d.temp_max) ? d.temp_max : null,
        condition: dominant,
        icon: d.sampleIcon,
        units: d.units,
      }
    })
    // sort by date ascending
    .sort((a, b) => (a.date || 0) - (b.date || 0))

  return { hourly, daily }
}

// PUBLIC_INTERFACE
export async function getCurrentWeather(lat, lon, units = 'metric', provider = DEFAULT_PROVIDER) {
  /** Fetch current weather for coordinates and normalize to app schema. */
  if (!lat || !lon) throw new Error('getCurrentWeather: lat and lon are required')
  if (!VITE_WEATHER_API_KEY && (!VITE_API_BASE || !VITE_API_BASE.length)) {
    // Note for integrators: Either configure VITE_WEATHER_API_KEY for direct OpenWeather,
    // or set VITE_API_BASE to a proxy that injects credentials.
    if (VITE_LOG_LEVEL !== 'silent') {
      // eslint-disable-next-line no-console
      console.warn('Weather API: No VITE_WEATHER_API_KEY or VITE_API_BASE set.')
    }
  }

  switch (provider) {
    case 'openweather': {
      const url = buildOpenWeatherUrl('weather', {
        lat,
        lon,
        units: OPENWEATHER_UNITS[units] || OPENWEATHER_UNITS.metric,
      })
      const data = await fetchWithRetry(url)
      return normalizeCurrentOpenWeather(data, units)
    }
    default:
      throw new Error(`Unsupported weather provider: ${provider}`)
  }
}

// PUBLIC_INTERFACE
export async function getForecast(lat, lon, units = 'metric', provider = DEFAULT_PROVIDER) {
  /** Fetch forecast for coordinates and return normalized hourly and daily arrays. */
  if (!lat || !lon) throw new Error('getForecast: lat and lon are required')

  switch (provider) {
    case 'openweather': {
      const url = buildOpenWeatherUrl('forecast', {
        lat,
        lon,
        units: OPENWEATHER_UNITS[units] || OPENWEATHER_UNITS.metric,
      })
      const data = await fetchWithRetry(url)
      return normalizeForecastOpenWeather(data, units)
    }
    default:
      throw new Error(`Unsupported weather provider: ${provider}`)
  }
}

// PUBLIC_INTERFACE
export function createWeatherService(options = {}) {
  /**
   * Factory to create a service instance with pre-bound provider and defaults.
   * Options:
   * - provider: 'openweather' (default)
   * - units: 'metric' | 'imperial' | 'standard'
   */
  const provider = options.provider || DEFAULT_PROVIDER
  const units = options.units || 'metric'

  return {
    // PUBLIC_INTERFACE
    async current(lat, lon) {
      /** Get current conditions using pre-bound units/provider */
      return getCurrentWeather(lat, lon, units, provider)
    },
    // PUBLIC_INTERFACE
    async forecast(lat, lon) {
      /** Get forecast using pre-bound units/provider */
      return getForecast(lat, lon, units, provider)
    },
    provider,
    units,
  }
}

export default {
  getCurrentWeather,
  getForecast,
  createWeatherService,
}
