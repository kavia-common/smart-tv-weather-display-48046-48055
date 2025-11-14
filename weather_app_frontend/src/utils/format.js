const { VITE_NODE_ENV } = import.meta.env

// PUBLIC_INTERFACE
export function formatTemp(value, units = 'metric', opts = {}) {
  /** Format a temperature with unit symbol, rounded by default. */
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—'
  }
  const { decimals = 0 } = opts
  const n = Number(value)
  const u = units === 'imperial' ? '°F' : units === 'standard' ? 'K' : '°C'
  return `${n.toFixed(decimals)}${u}`
}

// PUBLIC_INTERFACE
export function formatWind(speed, units = 'metric', opts = {}) {
  /** Format wind speed with unit labeling (m/s or mph). */
  if (speed === null || speed === undefined || Number.isNaN(Number(speed))) {
    return '—'
  }
  const { decimals = 0 } = opts
  const n = Number(speed)
  const label = units === 'imperial' ? 'mph' : 'm/s'
  return `${n.toFixed(decimals)} ${label}`
}

// PUBLIC_INTERFACE
export function formatTime(ts, locale = undefined, opts = {}) {
  /** Format a timestamp (ms) to time string, default: hour/minutes. */
  if (!ts || Number.isNaN(Number(ts))) return '—'
  const date = new Date(Number(ts))
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    ...opts,
  })
  return formatter.format(date)
}

// PUBLIC_INTERFACE
export function formatDate(ts, locale = undefined, opts = {}) {
  /** Format a timestamp (ms) to date string, default: short weekday and date. */
  if (!ts || Number.isNaN(Number(ts))) return '—'
  const date = new Date(Number(ts))
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...opts,
  })
  return formatter.format(date)
}

// PUBLIC_INTERFACE
export function mapConditionToIcon(weather = {}) {
  /**
   * Map a provider condition to an internal icon token (Lightning asset or font).
   * Serves as a fallback mapping when provider icon codes aren't available.
   * Expected input example (OpenWeather):
   * { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }
   *
   * Returns an icon token (string) like 'clear-day', 'cloudy', 'rain', etc.
   */
  const iconCode = (weather.icon || '').toLowerCase()
  const main = (weather.main || '').toLowerCase()

  // First attempt: map OpenWeather icon codes
  // 01d/01n: clear, 02: few clouds, 03/04: clouds, 09/10: rain, 11: thunder, 13: snow, 50: mist
  if (iconCode.startsWith('01')) return iconCode.endsWith('n') ? 'clear-night' : 'clear-day'
  if (iconCode.startsWith('02')) return 'partly-cloudy'
  if (iconCode.startsWith('03') || iconCode.startsWith('04')) return 'cloudy'
  if (iconCode.startsWith('09') || iconCode.startsWith('10')) return 'rain'
  if (iconCode.startsWith('11')) return 'thunderstorm'
  if (iconCode.startsWith('13')) return 'snow'
  if (iconCode.startsWith('50')) return 'mist'

  // Fallback by main category
  if (main.includes('clear')) return 'clear-day'
  if (main.includes('cloud')) return 'cloudy'
  if (main.includes('rain') || main.includes('drizzle')) return 'rain'
  if (main.includes('thunder')) return 'thunderstorm'
  if (main.includes('snow')) return 'snow'
  if (main.includes('mist') || main.includes('fog') || main.includes('haze')) return 'mist'

  if (VITE_NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('mapConditionToIcon: unrecognized weather mapping', weather)
  }
  return 'unknown'
}

export default {
  formatTemp,
  formatWind,
  formatTime,
  formatDate,
  mapConditionToIcon,
}
