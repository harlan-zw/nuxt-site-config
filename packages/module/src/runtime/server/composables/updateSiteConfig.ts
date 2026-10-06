import type { RequestEvent } from 'nuxt/server'
import type { SiteConfigInput } from 'site-config-stack'
import { createSiteConfigStack } from 'site-config-stack'

export function updateSiteConfig(e: Pick<RequestEvent, 'context'>, input: SiteConfigInput): void {
  e.context.siteConfig = e.context.siteConfig || createSiteConfigStack()
  e.context.siteConfig.push(input)
}
