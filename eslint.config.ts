// .eslintrc.ts
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import ts from '@typescript-eslint/eslint-plugin';
import { globalIgnores } from 'eslint/config';

export default [
  globalIgnores(['dist']),

  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    plugins: {
      reactHooks,
      reactRefresh,
    },
    rules: {
      // custom JS rules here
    },
  },

  // TS/TSX files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': ts,
      reactHooks,
      reactRefresh,
    },
    extends: [
      js.configs.recommended,
      ts.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    rules: {
      // custom TS rules here
    },
  },
];
