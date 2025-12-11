import type { H3Event } from 'h3'
import { useRequestEvent } from '#app'

export function getNitroOrigin(e?: H3Event): string {
  if (import.meta.server) {
    e = e || useRequestEvent()
    return e?.context?.siteConfigNitroOrigin || ''
  }
  return window.location.origin
}
