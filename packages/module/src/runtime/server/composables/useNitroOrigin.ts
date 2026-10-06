import type { RequestEvent } from 'nuxt/server'
import { getNitroOrigin } from './getNitroOrigin'

/**
 * @deprecated please use getNitroOrigin instead
 */
export function useNitroOrigin(e?: Pick<RequestEvent, 'context'> & Partial<Pick<RequestEvent, 'req'>>): string {
  return getNitroOrigin(e)
}
