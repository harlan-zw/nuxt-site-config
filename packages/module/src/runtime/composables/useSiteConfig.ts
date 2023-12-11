import type { GetSiteConfigOptions, SiteConfig } from 'site-config-stack'
import type { NuxtSiteConfig } from '../types'
import {
  toValue,
  useNuxtApp,
  useRequestEvent,
} from '#imports'

export function useSiteConfig(options?: GetSiteConfigOptions): NuxtSiteConfig {
  let stack: Omit<SiteConfig, '_context'>
  if (process.server)
    stack = useRequestEvent().context.siteConfig.get(options) as SiteConfig
  else
    stack = useNuxtApp().$nuxtSiteConfig.get(options) as SiteConfig

  Object.entries(stack)
    .forEach(([k, v]) => {
      stack[k] = toValue(v)
    })
  return stack as NuxtSiteConfig
}
