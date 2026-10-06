import type { SiteConfigStack } from 'site-config-stack'
import { useNuxtApp, useRequestEvent } from 'nuxt/app'

export function getSiteConfigStack(): SiteConfigStack {
  return (import.meta.server ? useRequestEvent()?.context.siteConfig : useNuxtApp().$nuxtSiteConfig)!
}
