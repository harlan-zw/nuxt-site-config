import type { H3Event } from 'h3'
import { createSiteConfigContainer } from '../../siteConfig'

export function useSiteConfig(e: H3Event) {
  e.context.siteConfig = e.context.siteConfig || createSiteConfigContainer()
  return e.context.siteConfig.get()
}
