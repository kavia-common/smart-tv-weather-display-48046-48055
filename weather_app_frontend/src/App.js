import Blits from '@lightningjs/blits'
import Home from './pages/Home.js'
import Forecast from './pages/Forecast.js'
import Settings from './pages/Settings.js'
import Theme from './plugins/theme.js'

/**
 * App shell for the Smart TV Weather app.
 * - Provides RouterView for page rendering
 * - Registers '/', '/forecast', '/settings' routes
 * - Registers global Ocean Professional theme plugin
 */
export default Blits.Application({
  // Register theme plugin for global access via this.$theme
  plugins: [Theme.plugin],

  // Global store placeholder (kept)
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
