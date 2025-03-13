import type { NuxtDevtoolsClient } from '@nuxt/devtools-kit/types'
import type { $Fetch } from 'nitropack'
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import { ref, watchEffect } from 'vue'
import { refreshSources } from './state'

export const appFetch = ref<$Fetch>()

export const devtools = ref<NuxtDevtoolsClient>()

export const colorMode = ref<'dark' | 'light'>()

onDevtoolsClientConnected(async (client) => {
  // @ts-expect-error untyped
  appFetch.value = client.host.app.$fetch
  watchEffect(() => {
    colorMode.value = client.host.app.colorMode.value
  })
  devtools.value = client.devtools
  refreshSources()
})
