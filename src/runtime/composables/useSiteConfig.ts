import { joinURL } from 'ufo'
import { getRequestURL } from 'h3'
import type { SiteConfig } from '../../type'
import { SITE_CONFIG_ENV, createSiteConfig } from '../shared'

// @ts-expect-error runtime types
import {
  computed, onBeforeUnmount,
  onMounted,
  ref,
  useAppConfig,
  useRequestEvent, useRuntimeConfig, watchEffect,
} from '#imports'

function useRequestURL() {
  if (process.server) {
    const { baseURL } = useRuntimeConfig().app
    const url = getRequestURL(useRequestEvent())
    url.pathname = joinURL(baseURL, url.pathname)
    return url
  }
  return new URL(window.location.href)
}

export function useSiteConfig(overrides: Partial<SiteConfig> = {}) {
  const siteConfigInput = ref()
  const siteConfig = createSiteConfig({ overrides })

  function computeConfig() {
    const { baseURL } = useRuntimeConfig().app
    const contextConfig: Partial<SiteConfig> = {
      url: joinURL(useRequestURL().origin, baseURL),
    }
    const { public: publicRuntimeConfig } = useRuntimeConfig()
    const appConfig = useAppConfig()
    // defaults from public runtime
    const runtimeConfig: Partial<SiteConfig> = {}
    for (const k of Object.keys(SITE_CONFIG_ENV) as (keyof SiteConfig)[]) {
      // default to app config first
      // @ts-expect-error untyped
      runtimeConfig[k] = appConfig.site?.[k] || publicRuntimeConfig.site?.[k]
    }
    siteConfigInput.value = { runtimeConfig, contextConfig }
  }
  watchEffect(computeConfig)
  // unmounts of other pages may take effect
  onMounted(computeConfig)
  onBeforeUnmount(() => {
    siteConfig.cleanUp && siteConfig.cleanUp()
  })

  return computed(() => siteConfig.compute(siteConfigInput.value))
}
