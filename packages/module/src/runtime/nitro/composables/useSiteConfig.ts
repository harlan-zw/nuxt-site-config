import type { H3Event } from 'h3'
import { createSiteConfigStack } from 'site-config-stack'

export function useSiteConfig(e: H3Event) {
  e.context.siteConfig = e.context.siteConfig || createSiteConfigStack()
  return e.context.siteConfig.get()
}
