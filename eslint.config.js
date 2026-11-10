import js from '@eslint/js';
import globals from 'globals';
import boundaries from 'eslint-plugin-boundaries';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist/'] },
  js.configs.recommended,
  { languageOptions: { globals: globals.node } },
  eslintConfigPrettier,

  // Modüler monolit sınırları
  {
    files: ['apps/api/src/**/*.js'],
    plugins: { boundaries },
    settings: {
      'boundaries/legacy-templates': false,
      'boundaries/elements': [
        { type: 'module', pattern: 'apps/api/src/modules/*', capture: ['module'] },
        { type: 'shared', pattern: 'apps/api/src/shared/*' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          policies: [
            {
              // Kural 1: başka modülün içine değil, sadece index.js'ine erişilir
              from: { element: { type: 'module' } },
              disallow: {
                to: {
                  element: {
                    type: 'module',
                    captured: { module: '!{{ from.element.captured.module }}' },
                    fileInternalPath: '!index.js',
                  },
                },
              },
              message:
                '{{ to.element.captured.module }} modülüne sadece index.js (public API) üzerinden erişilebilir',
            },
            {
              // shared/ ortak altyapıdır; hiçbir modülü bilemez
              from: { element: { type: 'shared' } },
              disallow: { to: { element: { type: 'module' } } },
              message: 'shared/ hiçbir modüle bağımlı olamaz',
            },
          ],
        },
      ],
    },
  },
];
