import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    { input: 'src/build/index' },
  ],
  externals: [
    '#imports',
    'h3',
  ],
})
