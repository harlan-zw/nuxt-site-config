import antfu from '@antfu/eslint-config'
import harlanzw from 'eslint-plugin-harlanzw'

export default antfu(
  {
    type: 'lib',
  },
  ...harlanzw({
    // base covers `playground/`, this repo's dev app is `.playground/`
    base: { ignores: ['.playground/**'] },
    link: true,
    nuxt: true,
    vue: true,
  }),
  {
    files: ['**/runtime/server/**/*.ts', '**/runtime/app/**/useNitroOrigin.ts', '**/kit/src/**/*.ts'],
    rules: {
      'harlanzw/vue-no-faux-composables': 'off',
    },
  },
  {
    files: [
      '**/runtime/app/**/getNitroOrigin.ts',
      '**/runtime/app/**/utils.ts',
      '**/runtime/server/**/getSiteConfig.ts',
    ],
    rules: {
      'harlanzw/vue-require-composable-prefix': 'off',
    },
  },
)
