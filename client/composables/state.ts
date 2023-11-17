import { ref } from 'vue'
import type { ModuleRuntimeConfig } from '../../packages/module/src/runtime/types'
import type { SiteConfig, SiteConfigStack } from '../../packages/site-config/src/type'
import { appFetch } from './rpc'

export const data = ref<{
  nitroOrigin: string
  config: SiteConfig
  stack: SiteConfigStack[]
  runtimeConfig: ModuleRuntimeConfig
} | null>(null)

export async function refreshSources() {
  if (appFetch.value)
    data.value = await appFetch.value('/__site-config__/debug.json')
}
