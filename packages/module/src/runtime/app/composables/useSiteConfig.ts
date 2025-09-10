import type { GetSiteConfigOptions } from 'site-config-stack'
import type { NuxtSiteConfig } from '../../types'
import {
  useNuxtApp,
  useRequestEvent,
} from '#app'
import { defu } from 'defu'
import { reactive, watchEffect } from 'vue'

export function useSiteConfig(options?: GetSiteConfigOptions): NuxtSiteConfig {
  const stack = import.meta.server ? useRequestEvent()?.context.siteConfig.get(defu({ resolveRefs: true }, options)) : reactive<NuxtSiteConfig>({} as NuxtSiteConfig)
  if (import.meta.client) {
    watchEffect(() => {
      const data = (useNuxtApp().$nuxtSiteConfig as any).get(defu({ resolveRefs: true }, options)) as NuxtSiteConfig
      if (stack && data) {
        Object.assign(stack, data)
      }
    })
  }
  delete (stack as any)._priority
  return stack as NuxtSiteConfig
}
