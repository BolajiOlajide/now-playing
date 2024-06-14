import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

const config = [
  {
    input: "./src/index.ts",
    output: {
      file: "dist/now-playing.cjs.js",
      format: "cjs",
      sourcemap: true,
    },
    external: ["zod", "node-fetch"],
    plugins: [typescript()],
  },
  {
    input: "./src/index.ts",
    output: {
      file: "dist/now-playing.esm.js",
      format: "es",
      sourcemap: true,
    },
    external: ["zod", "node-fetch"],
    plugins: [typescript()],
  },
  {
    input: "./src/index.ts",
    output: {
      file: "dist/now-playing.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];

export default config;
