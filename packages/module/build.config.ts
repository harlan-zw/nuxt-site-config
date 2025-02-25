import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    { input: 'src/kit', name: 'kit' },
    { input: 'src/utils', name: 'utils' },
    { input: 'src/urls', name: 'urls' },
  ],
  externals: [
    '#imports',
    'h3',
  ],
})
