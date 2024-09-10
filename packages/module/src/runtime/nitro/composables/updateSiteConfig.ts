import { createSiteConfigStack } from 'site-config-stack'
import type { H3Event } from 'h3'
import type { SiteConfigInput } from 'site-config-stack'

export function updateSiteConfig(e: H3Event, input: SiteConfigInput): void {
  e.context.siteConfig = e.context.siteConfig || createSiteConfigStack()
  e.context.siteConfig.push(input)
}
