import type { H3Event } from 'h3'
import { useRequestEvent } from 'nuxt/app'

export function useNitroOrigin(e?: H3Event): string {
  if (process.server) {
    e = e || useRequestEvent()
    return e?.context?.siteConfigNitroOrigin || ''
  }
  if (process.client)
    return window.location.origin

  return ''
}
