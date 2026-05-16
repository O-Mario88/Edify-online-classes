import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'edify_backend'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // Design tokens are the source of truth. Hardcoded hex/rgb in className strings
      // creates the "three competing design languages" problem flagged in the audit.
      // The Phase 0 sweep brought violations to zero; the rule is now an error so
      // new violations fail CI. To add a new color, define it in tailwind.config.js
      // (or as a CSS variable in src/index.css) and reference the semantic name.
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/(?:bg|text|border|ring|from|to|via|fill|stroke|outline|decoration|placeholder|accent|caret|divide|shadow)-\\[#[0-9a-fA-F]{3,8}\\]/]",
          message: 'Tailwind arbitrary hex color literal — replace with a semantic design token from tailwind.config.js. See docs/STRATEGY.md.',
        },
        {
          selector: "TemplateElement[value.raw=/(?:bg|text|border|ring|from|to|via|fill|stroke|outline|decoration|placeholder|accent|caret|divide|shadow)-\\[#[0-9a-fA-F]{3,8}\\]/]",
          message: 'Tailwind arbitrary hex color in template literal — replace with a semantic design token.',
        },
      ],
    },
  },
)
