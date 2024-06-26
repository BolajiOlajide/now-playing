import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'

const config = [
  {
    input: './src/index.ts',
    output: [
      {
        file: 'dist/now-playing.mjs',
        format: 'esm',
        sourcemap: true,
        name: 'NowPlaying',
      },
      {
        file: './dist/now-playing.js',
        format: 'umd',
        sourcemap: true,
        name: 'NowPlaying',
      },
    ],
    external: ['zod', 'node-fetch'],
    plugins: [typescript()],
  },
  {
    input: './src/index.ts',
    output: {
      file: 'dist/now-playing.d.ts',
      format: 'esm',
    },
    plugins: [dts()],
  },
]

export default config
