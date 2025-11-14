import Blits from '@lightningjs/blits'

/**
 * Forecast page
 * Shows multi-day forecast. Placeholder to validate routing and layout.
 */
export default Blits.Component('Forecast', {
  template: `
    <Element w="1920" h="1080">
      <Element x="96" y="72">
        <Text size="64" content="Forecast" />
        <Text y="88" size="36" color="#9CA3AF" content="Route: /forecast" />
      </Element>

      <Element x="96" y="240">
        <Text size="28" color="#9CA3AF" content="Use Back to return" />
      </Element>
    </Element>
  `,
  input: {
    back() {
      this.$router.back()
    },
  },
})
