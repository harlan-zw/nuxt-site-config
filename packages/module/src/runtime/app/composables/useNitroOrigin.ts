import type { RequestEvent } from 'nuxt/server'
import { getNitroOrigin } from './getNitroOrigin'

/**
 * @deprecated use getNitroOrigin instead
 */
export function useNitroOrigin(e?: Pick<RequestEvent, 'context'>): string {
  return getNitroOrigin(e)
}
