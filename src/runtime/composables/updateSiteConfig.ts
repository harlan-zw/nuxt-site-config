import type {
  SiteConfigContainer,
  SiteConfigInput,
} from '../../type'
import { useNuxtApp, useRequestEvent } from '#imports'

export function updateSiteConfig(input: SiteConfigInput = {}) {
  if (process.server) {
    const container = useRequestEvent().context.siteConfig
    container.push(input)
    return
  }

  const container = useNuxtApp().$siteConfig as SiteConfigContainer
  container.push(input)
}
