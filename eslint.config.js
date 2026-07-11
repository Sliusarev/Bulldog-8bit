// ESLint flat config. Two rule sets: browser code (src/**, runs in the
// game) and Node code (config files, which run during build/CI, not in
// the browser).
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
  },
  {
    files: ["*.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
  },
  {
    // Vitest injects describe/it/expect as globals in test files.
    files: ["**/*.test.js"],
    languageOptions: {
      globals: globals.vitest,
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
