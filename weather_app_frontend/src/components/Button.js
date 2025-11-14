import Blits from '@lightningjs/blits'
import Theme from '../plugins/theme.js'

/**
 * Themed Button component for TV remote interactions.
 * Props:
 *  - label: text to show
 *  - onPress: function to call on enter
 *  - w, h: optional size
 *  - variant: 'primary' | 'default'
 */
export default Blits.Component('Button', {
  props: ['label', 'onPress', 'w', 'h', 'variant'],
  state() {
    return {
      focused: false,
    }
  },
  computed: {
    bg() {
      const base = '#1F2937' // gray-800
      const primary = Theme.colors.primary
      return this.variant === 'primary'
        ? (this.focused ? primary : primary)
        : (this.focused ? primary : base)
    },
    textColor() {
      return '#ffffff'
    },
    borderColor() {
      return this.focused ? Theme.colors.secondary : Theme.colors.border
    },
  },
  template: `
    <Element :w="$w || 320" :h="$h || 88">
      <Element :w="$w || 320" :h="$h || 88" :color="$bg" :alpha="$focused ? 1 : 0.95" />
      <Element :w="$w || 320" :h="$h || 88" :color="$borderColor" alpha="0.18" />
      <Text :content="$label || 'Button'" x="32" y="26" :fontSize="$focused ? 32 : 28" :color="$textColor" />
    </Element>
  `,
  input: {
    enter() {
      if (this.onPress) this.onPress()
    },
    left(e) { this.parent && this.parent.focus && this.parent.focus(e) },
    right(e) { this.parent && this.parent.focus && this.parent.focus(e) },
    up(e) { this.parent && this.parent.focus && this.parent.focus(e) },
    down(e) { this.parent && this.parent.focus && this.parent.focus(e) },
  },
  focus() { this.focused = true },
  unfocus() { this.focused = false },
})
