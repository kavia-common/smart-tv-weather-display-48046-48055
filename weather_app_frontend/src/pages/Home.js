import Blits from '@lightningjs/blits'
import Panel from '../components/Panel.js'
import WeatherNow from '../components/WeatherNow.js'
// Integration hint: to render horizontally scrollable forecast carousels, import:
// import ForecastList from '../components/ForecastList.js'
// import ForecastItem from '../components/ForecastItem.js'

export default Blits.Component('Home', {
  components: { Panel, WeatherNow },

  state() {
    return {
      ready: false
    }
  },

  template: `
    <Element w="1920" h="960">
      <!-- Current conditions hero component -->
      <WeatherNow />

      <!-- Secondary panels below -->
      <Panel x="80" y="700" w="760" h="320" header="Highlights">
        <Text x="0" y="0" content="UV Index:" fontSize="36" color="0xff111827" />
        <Text x="0" y="56" content="Humidity:" fontSize="30" color="0xff374151" />
      </Panel>

      <Panel x="880" y="700" w="960" h="320" header="Tips" elevated="true">
        <Text x="0" y="0" content="Press Enter on current conditions to view the forecast." fontSize="30" color="0xff374151" />
      </Panel>
    </Element>
  `,

  lifecycle: {
    mounted() {
      // Demo: use global app toast once on mount
      if (this.$app && this.$app.toast) {
        this.$app.toast('Welcome to Ocean Weather', 'info', 2200)
      }
      // Demo: set location (would be set after fetching location)
      if (this.$app && this.$app.setLocation) {
        this.$app.setLocation('San Francisco, CA')
      }
      this.ready = true
    }
  }
})
