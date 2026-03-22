import antfu from '@antfu/eslint-config'
import harlanzw from 'eslint-plugin-harlanzw'

export default antfu(
  {
    type: 'lib',
    ignores: [
      'CLAUDE.md',
      'test/fixtures/**',
      'playground/**',
      '.playground/**',
    ],
    rules: {
      'no-use-before-define': 'off',
      'node/prefer-global/process': 'off',
      'node/prefer-global/buffer': 'off',
    },
  },
  {
    files: ['**/test/**/*.ts', '**/test/**/*.js'],
    rules: {
      'ts/no-unsafe-function-type': 'off',
      'no-console': 'off',
    },
  },
  ...harlanzw({ link: true, nuxt: true, vue: true }),
  {
    files: ['**/runtime/server/**/*.ts', '**/runtime/app/**/useNitroOrigin.ts', '**/kit/src/**/*.ts'],
    rules: {
      'harlanzw/vue-no-faux-composables': 'off',
    },
  },
)
