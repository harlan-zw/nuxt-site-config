import type { SiteConfigStack } from 'site-config-stack'
import type { NuxtSiteConfig } from '../types'
import {
  useNuxtApp,
  useRequestEvent,
} from '#imports'

export function useSiteConfig() {
  if (process.server) {
    const stack = useRequestEvent().context.siteConfig as SiteConfigStack
    // ensure a consistent api
    return stack.get() as NuxtSiteConfig
  }

  const stack = useNuxtApp().$siteConfig as SiteConfigStack
  return stack.get() as NuxtSiteConfig
}
