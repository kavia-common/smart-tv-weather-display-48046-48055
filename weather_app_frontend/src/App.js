import Blits from '@lightningjs/blits'
import Home from './pages/Home.js'
import Forecast from './pages/Forecast.js'
import Settings from './pages/Settings.js'
import Theme from './plugins/theme.js'

// Shared UI components
import Header from './components/Header.js'
import Toast from './components/Toast.js'

/**
 * App shell for the Smart TV Weather app.
 * - Provides RouterView for page rendering
 * - Registers '/', '/forecast', '/settings' routes
 * - Registers global Ocean Professional theme plugin
 * - Renders a global Header and Toast
 */
export default Blits.Application({
  // Register theme plugin for global access via this.$theme
  plugins: [Theme.plugin],

  components: { Header, Toast },

  store: {
    location: 'New York, US',
    units: 'metric', // 'metric' | 'imperial'
  },

  state() {
    return {
      location: this.store.location || 'Loading...',
      toastRef: null,
    }
  },

  template: `
    <Element w="1920" h="1080" :color="$theme.colors.background">
      <!-- Global Header -->
      <Header
        title="Ocean Weather"
        :location="$location"
        timeFormat="24h"
      />

      <!-- Routed pages area below header -->
      <Element y="120" w="1920" h="960">
        <RouterView />
      </Element>

      <!-- Global Toast -->
      <Toast ref="toast" />
    </Element>
  `,

  routes: [
    { path: '/', component: Home, options: { transition: 'fade' } },
    { path: '/forecast', component: Forecast, options: { transition: 'fade' } },
    { path: '/settings', component: Settings, options: { transition: 'fade' } },
  ],

  lifecycle: {
    mounted() {
      this.toastRef = this.$refs.toast
    }
  },

  methods: {
    // PUBLIC_INTERFACE
    setLocation(name) {
      /** Update the location shown in the header and store. */
      this.location = name
      this.store.location = name
    },

    // PUBLIC_INTERFACE
    toast(message, type = 'info', duration = 3000) {
      /** Show a global toast message. */
      if (this.toastRef && this.toastRef.show) {
        this.toastRef.show(message, type, duration)
      }
    }
  }
})
