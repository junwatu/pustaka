import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

import pkg from "./package.json";

export default {
  input: "src/index.js",  // NOTE: As you start converting, you'll change this to `.ts`.
  plugins: [typescript(), terser(), json({ compact: true }), nodeResolve()],
  output: [
    {
      file: pkg.module,
      format: "esm",
    },
    {
      file: pkg.browser,
      format: "iife",
      name: "KalenderJawa",
    },
    {
      file: pkg.main,
      format: "cjs",
    },
  ],
};
