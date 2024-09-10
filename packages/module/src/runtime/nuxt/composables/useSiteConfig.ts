import {
  useNuxtApp,
  useRequestEvent,
} from '#imports'
import { defu } from 'defu'
import type { GetSiteConfigOptions, SiteConfigResolved } from 'site-config-stack'
import type { NuxtSiteConfig } from '../../types'

export function useSiteConfig(options?: GetSiteConfigOptions): NuxtSiteConfig {
  let stack: Omit<SiteConfigResolved, '_context'>
  if (process.server)
    stack = useRequestEvent().context.siteConfig.get(defu({ resolveRefs: true }, options))
  else
    stack = useNuxtApp().$nuxtSiteConfig
  return (stack || {}) as NuxtSiteConfig
}
