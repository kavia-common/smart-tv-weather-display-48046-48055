import Blits from '@lightningjs/blits'
import Panel from '../components/Panel.js'

export default Blits.Component('Home', {
  components: { Panel },

  state() {
    return {
      ready: false
    }
  },

  template: `
    <Element w="1920" h="960">
      <Panel x="80" y="40" w="760" h="360" header="Current Weather">
        <Text x="0" y="0" content="Temperature:" fontSize="36" color="0xff111827" />
        <Text x="0" y="56" content="Wind:" fontSize="30" color="0xff374151" />
      </Panel>

      <Panel x="880" y="40" w="960" h="360" header="Highlights" elevated="true">
        <Text x="0" y="0" content="UV Index:" fontSize="36" color="0xff111827" />
        <Text x="0" y="56" content="Humidity:" fontSize="30" color="0xff374151" />
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
