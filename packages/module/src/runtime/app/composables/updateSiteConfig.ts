import type {
  SiteConfigInput,
} from 'site-config-stack'
import { useNuxtApp, useRequestEvent } from '#app'

export function updateSiteConfig(input: SiteConfigInput = {}): () => void {
  const stack = import.meta.server ? useRequestEvent()?.context.siteConfig : useNuxtApp().$nuxtSiteConfig
  return stack!.push(input)
}
