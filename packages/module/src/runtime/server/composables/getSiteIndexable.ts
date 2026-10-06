import type { RequestEvent } from 'nuxt/server'
import { getSiteConfig } from './getSiteConfig'

export function getSiteIndexable(e: Pick<RequestEvent, 'context'>): boolean {
  // move towards deprecating indexable
  const { env, indexable } = getSiteConfig(e)
  // legacy
  if (typeof indexable !== 'undefined')
    return String(indexable) === 'true'

  return env === 'production'
}
