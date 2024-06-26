import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@BolajiOlajide/now-playing',
    dir: './src',
    open: false,
    bail: 3,
  },
})
