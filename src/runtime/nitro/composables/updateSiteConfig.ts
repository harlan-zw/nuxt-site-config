import type { H3Event } from 'h3'
import type { SiteConfigInput } from '../../../type'
import { createSiteConfigContainer } from '../../siteConfig'

export function updateSiteConfig(e: H3Event, input: SiteConfigInput) {
  e.context.siteConfig = e.context.siteConfig || createSiteConfigContainer()
  e.context.siteConfig.push(input)
}
