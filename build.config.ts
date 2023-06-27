import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    { input: 'src/kit/index', name: 'kit' },
  ],
  externals: [
    '#imports',
    'h3',
  ],
})
