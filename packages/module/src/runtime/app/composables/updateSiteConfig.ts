import type {
  SiteConfigInput,
} from 'site-config-stack'
import { consola } from 'consola'
import { useRequestEvent } from 'nuxt/app'

export function updateSiteConfig(input: SiteConfigInput = {}): void {
  if (import.meta.server) {
    const stack = useRequestEvent()?.context.siteConfig
    stack?.push(input)
    return
  }
  if (import.meta.dev)
    consola.warn('[Nuxt Site Config] \`updateSiteConfig\` is only available on server-side.')
}
