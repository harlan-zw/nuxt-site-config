import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    { input: 'src/build' },
  ],
  externals: [
    '#imports',
    'h3',
  ],
})
