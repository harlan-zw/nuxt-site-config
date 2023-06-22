import type { SiteConfigContainer } from '../../type'
import {
  useNuxtApp,
  useRequestEvent,
} from '#imports'

export function useSiteConfig() {
  if (process.server) {
    const container = useRequestEvent().context.siteConfig as SiteConfigContainer
    // ensure a consistent api
    return container.get()
  }

  const container = useNuxtApp().$siteConfig as SiteConfigContainer
  return container.get()
}
