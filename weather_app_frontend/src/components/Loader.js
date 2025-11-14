import Blits from '@lightningjs/blits'
import Theme from '../plugins/theme.js'

export default Blits.Component('Loader', {
  template: `
    <Element>
      <Circle size="40" :color="$loaderColor || $theme.colors.primary" :alpha.transition="{value: $alpha, delay: 200}" />
      <Circle size="40" :color="$loaderColor || $theme.colors.secondary" x="60" :alpha.transition="{value: $alpha, delay: 300}" />
      <Circle size="40" :color="$loaderColor || $theme.colors.primary" x="120" :alpha.transition="{value: $alpha, delay: 400}" />
    </Element>
    `,
  /**
   * @type {['loaderColor']}
   */
  props: ['loaderColor'],
  state() {
    return {
      /**
       * Alpha of the circles, used to create a fade-in / fade-out transition
       */
      alpha: 0,
    }
  },
  hooks: {
    ready() {
      this.start()
    },
  },
  methods: {
    /**
     * Starts the loading transition in an interval
     * @returns {void}
     */
    start() {
      this.$setInterval(() => {
        this.alpha = this.alpha === 1 ? 0 : 1
      }, 800)
    },
  },
})
