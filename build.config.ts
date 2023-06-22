import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    { input: 'src/build/index', name: 'build'},
  ],
  externals: [
    '#imports',
    'h3',
  ],
})
