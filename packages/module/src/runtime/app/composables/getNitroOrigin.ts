import type { RequestEvent } from 'nuxt/server'
import { useRequestEvent } from '#app'

export function getNitroOrigin(e?: Pick<RequestEvent, 'context'>): string {
  if (import.meta.server) {
    e = e || useRequestEvent()
    return e?.context?.siteConfigNitroOrigin || ''
  }
  return window.location.origin
}
