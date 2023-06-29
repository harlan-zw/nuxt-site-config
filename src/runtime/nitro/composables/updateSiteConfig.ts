import type { H3Event } from 'h3'
import type { SiteConfigInput } from '../../../type'
import { createSiteConfigStack } from '../../siteConfig'

export function updateSiteConfig(e: H3Event, input: SiteConfigInput) {
  e.context.siteConfig = e.context.siteConfig || createSiteConfigStack()
  e.context.siteConfig.push(input)
}
