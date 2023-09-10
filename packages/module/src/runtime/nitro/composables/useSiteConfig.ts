import type { H3Event } from 'h3'
import type { SiteConfigInput } from 'site-config-stack'
import { createSiteConfigStack } from 'site-config-stack'
import type { NuxtSiteConfig } from '../../types'

export function useSiteConfig(e: H3Event) {
  e.context.siteConfig = e.context.siteConfig || createSiteConfigStack()
  return {
    get value(): NuxtSiteConfig {
      return e.context.siteConfig.get() as NuxtSiteConfig
    },
    set value(value: SiteConfigInput) {
      e.context.siteConfig.push(value)
    },
  }
}
