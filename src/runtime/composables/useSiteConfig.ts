import { joinURL } from 'ufo'
import { getRequestURL } from 'h3'
import type { MaybeComputedRefEntries, SiteConfig, SiteConfigInput } from '../../type'
import { SITE_CONFIG_ENV, createSiteConfigContainer } from '../shared'
import {
  onBeforeUnmount,
  onMounted,
  ref, unref,
  useAppConfig,
  useRequestEvent, useRuntimeConfig, watch, watchEffect,
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

export function useSiteConfig(overrides: MaybeComputedRefEntries<SiteConfigInput> = {}) {
  const siteConfig = ref<Partial<SiteConfig>>({})

  const siteConfigInput = ref({})
  const container = createSiteConfigContainer()

  watch(() => overrides, () => {
    const tmpOverridesInput: SiteConfigInput = {}
    // need to unref overrides fully
    const unrefdOverrides = unref(overrides)
    for (const k of Object.keys(unrefdOverrides)) {
      // @ts-expect-error untyped
      tmpOverridesInput[k] = unref(unrefdOverrides[k])
    }
    container.setOverrides(tmpOverridesInput)
    siteConfig.value = container.compute(siteConfigInput.value)
  }, {
    deep: true,
    immediate: true,
  })

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
    siteConfig.value = container.compute(siteConfigInput.value)
  }
  watchEffect(computeConfig)
  // unmounts of other pages may take effect
  onMounted(computeConfig)
  onBeforeUnmount(() => {
    container.cleanUp && container.cleanUp()
  })
  return siteConfig
}
