import Blits from '@lightningjs/blits'

/**
 * Settings page
 * Placeholder for app settings (units, location, etc.).
 */
export default Blits.Component('Settings', {
  state() {
    return {
      focusIdx: 0,
      items: [
        { id: 'units', label: 'Units', value: 'Metric' },
        { id: 'location', label: 'Location', value: 'New York, US' },
      ],
    }
  },
  template: `
    <Element w="1920" h="1080">
      <Element x="96" y="72">
        <Text size="64" content="Settings" />
        <Text y="88" size="36" color="#9CA3AF" content="Route: /settings" />
      </Element>

      <Element x="96" y="260">
        <Element
          :for="(item, index) in $items"
          :key="$item.id"
          :y="$index * 80"
        >
          <Text
            :content="($index === $focusIdx ? '▶ ' : '   ') + $item.label + ': ' + $item.value"
            size="40"
            :color="$index === $focusIdx ? '#F59E0B' : '#E5E7EB'"
          />
        </Element>
      </Element>
    </Element>
  `,
  input: {
    up() {
      this.focusIdx = Math.max(0, this.focusIdx - 1)
    },
    down() {
      this.focusIdx = Math.min(this.items.length - 1, this.focusIdx + 1)
    },
    back() {
      this.$router.back()
    },
  },
})
