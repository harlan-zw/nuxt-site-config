import type {
  SiteConfigInput,
} from 'site-config-stack'
import { useNuxtApp, useRequestEvent } from '#imports'

export function updateSiteConfig(input: SiteConfigInput = {}) {
  if (process.server) {
    const stack = useRequestEvent().context.siteConfig
    stack.push(input)
    return
  }

  const stack = useNuxtApp().$siteConfig
  stack.push(input)
}
