import { useRequestEvent } from '#imports'
import { consola } from 'consola'
import type {
  SiteConfigInput,
} from 'site-config-stack'

export function updateSiteConfig(input: SiteConfigInput = {}): void {
  if (process.server) {
    const stack = useRequestEvent().context.siteConfig
    stack.push(input)
    return
  }
  if (process.dev)
    consola.warn('[Nuxt Site Config] \`updateSiteConfig\` is only available on server-side.')
}
