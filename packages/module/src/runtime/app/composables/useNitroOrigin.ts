import type { H3Event } from 'h3'
import { getNitroOrigin } from './getNitroOrigin'

/**
 * @deprecated use getNitroOrigin instead
 */
export function useNitroOrigin(e?: H3Event): string {
  return getNitroOrigin(e)
}
