import type { NuxtSiteConfig } from '#site-config-virtual/types'
import type { GetSiteConfigOptions, SiteConfigResolved } from 'site-config-stack'
import { defu } from 'defu'
import {
  useNuxtApp,
  useRequestEvent,
} from 'nuxt/app'

export function useSiteConfig(options?: GetSiteConfigOptions): NuxtSiteConfig {
  let stack: Omit<SiteConfigResolved, '_context'>
  if (import.meta.server)
    stack = useRequestEvent()?.context.siteConfig.get(defu({ resolveRefs: true }, options))
  else
    stack = useNuxtApp().$nuxtSiteConfig
  return (stack || {}) as NuxtSiteConfig
}
