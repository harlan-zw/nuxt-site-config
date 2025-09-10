import type { H3Event } from 'h3'
import type { GetSiteConfigOptions } from 'site-config-stack'
import type { NuxtSiteConfig } from '../../types'
import { getSiteConfig } from './getSiteConfig'

/**
 * @deprecated please use getSiteConfig instead
 */
export function useSiteConfig(e: H3Event, _options?: GetSiteConfigOptions): NuxtSiteConfig {
  return getSiteConfig(e, _options)
}
