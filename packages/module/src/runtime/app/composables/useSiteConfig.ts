import type { GetSiteConfigOptions } from 'site-config-stack'
import type { NuxtSiteConfig } from '../../types'
import { defu } from 'defu'
import {
  useNuxtApp,
  useRequestEvent,
} from 'nuxt/app'
import { reactive, watchEffect } from 'vue'

export function useSiteConfig(options?: GetSiteConfigOptions): NuxtSiteConfig {
  const stack = import.meta.server ? useRequestEvent()?.context.siteConfig.get(defu({ resolveRefs: true }, options)) : reactive<NuxtSiteConfig>({} as NuxtSiteConfig)
  if (import.meta.client) {
    watchEffect(() => {
      const data = useNuxtApp().$nuxtSiteConfig.get(defu({ resolveRefs: true }, options))
      Object.assign(stack, data)
    })
  }
  delete stack._priority
  return stack as NuxtSiteConfig
}
