import type { SiteConfig } from 'site-config-stack'
import type { NuxtSiteConfig } from '../types'
import {
  toValue,
  useNuxtApp,
  useRequestEvent,
} from '#imports'

export function useSiteConfig(options?: { withContext?: boolean }) {
  let stack: Omit<SiteConfig, '_context'>
  if (process.server)
    stack = useRequestEvent().context.siteConfig.get() as SiteConfig
  else
    stack = useNuxtApp().$siteConfig.get() as SiteConfig

  if (!options?.withContext)
    delete stack._context

  Object.entries(stack).forEach(([k, v]) => {
    stack[k] = toValue(v)
  })
  return stack as NuxtSiteConfig
}
