import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';
import ts from 'typescript-eslint';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.dist/**',
      '**/.output/**',
      '**/coverage/**',
      '**/.git/**',
      '**/.vscode/**',
      '**/.idea/**',
      '**/.next/**',
      '**/.nuxt/**',
      '**/.turbo/**',
      '**/.cache/**',
      '**/.DS_Store',
      '**/*.log',
      '**/pnpm-lock.yaml',
      '**/package-lock.json',
      '**/yarn.lock',
      '**/migrations/**',
      '**/seeders/**',
      '**/cache/**',
      'apps/*/*/migrations/**',
      'apps/*/*/seeders/**',
      'apps/*/*/dist/**',
      'apps/*/*/build/**',
      'packages/*/dist/**',
      'packages/*/build/**',
      'docs/.vitepress/cache/**',
      'docs/.vitepress/dist/**',
      'docs/index.md',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      prettier: prettierPlugin,
      import: importPlugin,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          trailingComma: 'es5',
          printWidth: 80,
          tabWidth: 2,
          useTabs: false,
          bracketSpacing: true,
          arrowParens: 'avoid',
          endOfLine: 'lf',
        },
      ],
      semi: ['error', 'always'],
      'no-unused-vars': 'warn',
      'max-depth': ['warn', 5],
      'import/first': 'warn',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  ...ts.configs.recommended,
  {
    files: ['**/*.{js,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['../../**', '../../../**', '../../../../**'] },
      ],
    },
  },
];
