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
      const data = useNuxtApp().$nuxtSiteConfig.get(defu({ resolveRefs: true }, options))
      // @ts-expect-error untyped
      Object.assign(stack, data)
    })
  }
  // @ts-expect-error untyped
  delete stack._priority
  return stack as NuxtSiteConfig
}
