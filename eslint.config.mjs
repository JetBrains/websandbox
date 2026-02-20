import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  {
    files: ['**/*.{ts,js}'],
    extends: tseslint.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.mocha,
        sinon: 'readonly',
      },
    },
    rules: {
      'semi': ['error', 'always'],
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  }
);
