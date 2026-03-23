import type { ModuleRuntimeConfig } from '../../packages/module/src/runtime/types'
import type { SiteConfigResolved, SiteConfigStack } from '../../packages/site-config/src/type'
import { appFetch } from '#imports'
import { ref } from 'vue'

export const data = ref<{
  nitroOrigin: string
  config: SiteConfigResolved
  stack: SiteConfigStack[]
  runtimeConfig: ModuleRuntimeConfig
} | null>(null)

export async function refreshSources(): Promise<void> {
  if (appFetch.value)
    data.value = await appFetch.value('/__site-config__/debug.json')
}
