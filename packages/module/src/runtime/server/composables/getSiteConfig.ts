import type { H3Event } from 'h3'
import type { GetSiteConfigOptions } from 'site-config-stack'
import type { NuxtSiteConfig } from '../../types'
import { defu } from 'defu'
import { useRuntimeConfig } from 'nitropack/runtime'
import { createSiteConfigStack } from 'site-config-stack'
import { logger } from '../util'

export function getSiteConfig(e: H3Event, _options?: GetSiteConfigOptions): NuxtSiteConfig {
  if (import.meta.dev && !e.context._initedSiteConfig) {
    logger.warn('Site config has not been initialized yet. If you\'re trying to access site config in a server middleware then this not yet supported. See https://github.com/harlan-zw/nuxt-seo/issues/397')
  }
  e.context.siteConfig = e.context.siteConfig || createSiteConfigStack()
  const options = defu(_options, useRuntimeConfig(e)['nuxt-site-config'], { debug: false })
  return e.context.siteConfig.get(options) as NuxtSiteConfig
}
