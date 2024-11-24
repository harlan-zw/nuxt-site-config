import type { H3Event } from 'h3'
import type { GetSiteConfigOptions } from 'site-config-stack'
import type { NuxtSiteConfig } from '../../types'
import { useRuntimeConfig } from '#imports'
import { defu } from 'defu'
import { createSiteConfigStack } from 'site-config-stack'

export function useSiteConfig(e: H3Event, _options?: GetSiteConfigOptions): NuxtSiteConfig {
  e.context.siteConfig = e.context.siteConfig || createSiteConfigStack()
  const options = defu(_options, useRuntimeConfig(e)['nuxt-site-config'], { debug: false })
  return e.context.siteConfig.get(options) as NuxtSiteConfig
}
