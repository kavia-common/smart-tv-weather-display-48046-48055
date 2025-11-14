import Blits from '@lightningjs/blits'

import Home from './pages/Home.js'
import Forecast from './pages/Forecast.js'
import Settings from './pages/Settings.js'

/**
 * App shell for the Smart TV Weather app.
 * - Provides RouterView for page rendering
 * - Registers '/', '/forecast', '/settings' routes
 * - Wires a simple theme and global store placeholder for future use
 */
export default Blits.Application({
  // Basic app-level theme placeholder following Ocean Professional palette
  theme: {
    colors: {
      primary: '#2563EB',
      secondary: '#F59E0B',
      surface: '#ffffff',
      background: '#0b1220', // deeper blue for TV black levels
      text: '#E5E7EB',
      error: '#EF4444',
    },
    radius: 12,
    shadow: { alpha: 0.2 },
  },

  // Minimal global store placeholder - can be expanded later
  store: {
    location: 'New York, US',
    units: 'metric', // 'metric' | 'imperial'
  },

  template: `
    <Element w="1920" h="1080" :color="$theme.colors.background">
      <RouterView />
    </Element>
  `,

  routes: [
    { path: '/', component: Home, options: { transition: 'fade' } },
    { path: '/forecast', component: Forecast, options: { transition: 'fade' } },
    { path: '/settings', component: Settings, options: { transition: 'fade' } },
  ],
})
