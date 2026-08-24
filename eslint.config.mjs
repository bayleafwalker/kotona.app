import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      ".astro",
      ".wrangler",
      "dist",
      "node_modules",
      "worker-configuration.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,astro}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  {
    // Browser specs run their page callbacks inside the browser, where the
    // DOM globals are the whole point.
    files: ["tests/browser/**/*.mjs"],
    languageOptions: { globals: { document: "readonly", window: "readonly" } },
  },
];
