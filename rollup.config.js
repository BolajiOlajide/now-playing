import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

const config = [
  {
    input: "./src/index.ts",
    output: {
      file: "dist/now-playing.js",
      format: "cjs",
      sourcemap: true,
    },
    external: ["zod"],
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
