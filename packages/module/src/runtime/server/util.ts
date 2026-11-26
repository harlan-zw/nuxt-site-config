import { createConsola } from 'consola'
import { withoutBase } from 'ufo'

export const logger = /* #__PURE__ */ createConsola({
  defaults: {
    tag: 'nuxt-site-config',
  },
})

export function resolveRequestPath(event: { path?: string, url?: { pathname?: string } }, baseURL: string): string {
  const raw = event.url?.pathname ?? event.path ?? '/'
  return withoutBase(raw.split('?')[0] || '/', baseURL)
}

export function isNuxtErrorPath(pathname: string): boolean {
  return pathname === '/__nuxt_error' || pathname.startsWith('/__nuxt_error/')
}
