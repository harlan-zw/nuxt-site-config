import { refreshSources } from '#imports'

useDevtoolsConnection({
  onConnected: () => refreshSources(),
})
