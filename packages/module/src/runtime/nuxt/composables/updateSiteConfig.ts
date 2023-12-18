import type {
  SiteConfigInput,
} from 'site-config-stack'
import { consola } from 'consola'
import { useRequestEvent } from '#imports'

export function updateSiteConfig(input: SiteConfigInput = {}): void {
  if (process.server) {
    const stack = useRequestEvent().context.siteConfig
    stack.push(input)
  }
  if (process.dev)
    consola.warn('[Nuxt Site Config] \`updateSiteConfig\` is only available on server-side.')
}
