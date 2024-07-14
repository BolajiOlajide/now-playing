import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'
import typescript from '@rollup/plugin-typescript'

export default defineConfig({
  test: {
    name: '@BolajiOlajide/now-playing',
    dir: './src',
    open: false,
    bail: 3,
  },
  build: {
    sourcemap: 'hidden',
    lib: {
      entry: './src/index.ts',
      name: 'NowPlaying',
      formats: ['es', 'umd'],
      fileName: (format) => `now-playing.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['zod', 'node-fetch'],
      output: {
        globals: {
          'node-fetch': 'fetch',
          zod: 'zod',
        },
      },
      plugins: [typescript()],
    },
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.json',
      outDir: 'dist',
    }),
  ],
})
