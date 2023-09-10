import type { SiteConfig, SiteConfigInput, SiteConfigStack } from 'site-config-stack'
import type { NuxtSiteConfig } from '../types'
import {
  toValue,
  useNuxtApp,
  useRequestEvent,
} from '#imports'

export function useSiteConfig(options?: { withContext?: boolean }) {
  let stack: SiteConfigStack
  if (process.server)
    stack = useRequestEvent().context.siteConfig
  else
    stack = useNuxtApp().$siteConfig

  return {
    get value(): NuxtSiteConfig {
      const siteConfig: Omit<SiteConfig, '_context'> = stack.get()
      if (!options?.withContext)
        delete siteConfig._context

      Object.entries(siteConfig).forEach(([k, v]) => {
        siteConfig[k] = toValue(v)
      })

      return siteConfig as NuxtSiteConfig
    },
    set value(value: SiteConfigInput) {
      stack.push(value)
    },
  }
}
