import Blits from '@lightningjs/blits'
import App from './App.js'

// PUBLIC_INTERFACE
// Launch the Lightning Blits application with key mappings for typical TV remotes
Blits.Launch(App, 'app', {
  w: 1920,
  h: 1080,
  debugLevel: 1,
  keys: {
    up: ['ArrowUp'],
    down: ['ArrowDown'],
    left: ['ArrowLeft'],
    right: ['ArrowRight'],
    enter: ['Enter', 'NumpadEnter'],
    back: ['Backspace', 'Escape'],
  },
})
