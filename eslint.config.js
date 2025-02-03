import globals from 'globals';
import eslintJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      // Define your custom rules here
    },
  },
  eslintJs.configs.recommended, // Use ESLint's recommended rules
  eslintConfigPrettier, // Disable rules that conflict with Prettier
];