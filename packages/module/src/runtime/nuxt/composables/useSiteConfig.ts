import type { GetSiteConfigOptions, SiteConfigResolved } from 'site-config-stack'
import type { NuxtSiteConfig } from '../../types'
import {
  useNuxtApp,
  useRequestEvent,
} from '#imports'

export function useSiteConfig(options?: GetSiteConfigOptions): NuxtSiteConfig {
  let stack: Omit<SiteConfigResolved, '_context'>
  if (process.server)
    stack = useRequestEvent().context.siteConfig.get(options)
  else
    stack = useNuxtApp().$nuxtSiteConfig
  return stack as NuxtSiteConfig
}
