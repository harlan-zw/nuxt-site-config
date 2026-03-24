import type { AsyncData } from 'nuxt/app'
import { appFetch, refreshTime } from '#imports'

export interface SiteConfigDebugData {
  nitroOrigin: string
  config: Record<string, any>
  stack: Array<Record<string, any> & { _context?: string, _priority?: number }>
  runtimeConfig: Record<string, any>
  version?: string
}

export function useSiteConfigData(): AsyncData<SiteConfigDebugData | null, Error | null> {
  return useAsyncData<SiteConfigDebugData | null>('site-config-debug', async () => {
    if (!appFetch.value)
      return null
    return appFetch.value('/__site-config__/debug.json')
  }, { watch: [refreshTime] })
}
