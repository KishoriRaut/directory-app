import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignore generated PWA files (these are auto-generated and shouldn't be linted)
    "public/sw.js",
    "public/workbox-*.js",
    "public/**/*.js",
    "**/sw.js",
    "**/workbox-*.js",
  ]),
]);

export default eslintConfig;
