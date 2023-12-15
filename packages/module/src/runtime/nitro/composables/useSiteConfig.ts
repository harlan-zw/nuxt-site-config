import type { H3Event } from 'h3'
import type { GetSiteConfigOptions } from 'site-config-stack'
import { createSiteConfigStack } from 'site-config-stack'
import { defu } from 'defu'
import type { NuxtSiteConfig } from '../../types'
import { useRuntimeConfig } from '#imports'

export function useSiteConfig(e: H3Event, _options?: GetSiteConfigOptions): NuxtSiteConfig {
  e.context.siteConfig = e.context.siteConfig || createSiteConfigStack()
  const options = defu(_options, useRuntimeConfig()['nuxt-site-config'], { debug: false })
  return e.context.siteConfig.get(options) as NuxtSiteConfig
}
