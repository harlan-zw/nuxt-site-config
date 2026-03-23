<script setup lang="ts">
import type { KeyValueItem } from '@nuxtjs/seo/shared'
import type { SiteConfigInput } from '../packages/site-config/src'
import { computed, ref } from '#imports'
import { data, refreshSources } from './composables/state'

useDevtoolsConnection({
  onConnected: () => refreshSources(),
})

const loading = ref(false)

async function refresh() {
  loading.value = true
  data.value = null
  await refreshSources()
  setTimeout(() => {
    loading.value = false
  }, 300)
}

const tab = ref('config')

const stack = computed<Partial<SiteConfigInput>[]>(() => {
  return (data.value?.stack || []).toReversed()
})

function formatValue(value: unknown): string | boolean | undefined {
  if (value === undefined || value === null)
    return undefined
  if (typeof value === 'boolean')
    return value
  if (typeof value === 'string' || typeof value === 'number')
    return String(value)
  return JSON.stringify(value, null, 2)
}

const configItems = computed<KeyValueItem[]>(() => {
  const _config = { ...data.value?.config || {} }
  const context = _config._context || {}
  delete _config._context
  delete _config._priorities
  return Object.entries(_config).map(([key, value]) => ({
    key: context[key] ? `${key} (${context[key]})` : key,
    value: formatValue(value),
    copyable: true,
    mono: true,
  }))
})

function stackItems(input: Partial<SiteConfigInput>): KeyValueItem[] {
  const normalized = { ...input }
  delete normalized._priority
  delete normalized._context
  return Object.entries(normalized).map(([key, value]) => ({
    key,
    value: formatValue(value),
    copyable: true,
    mono: true,
  }))
}

const navItems = [
  { value: 'config', icon: 'carbon:settings', label: 'Config' },
  { value: 'stack', icon: 'carbon:stacked-scrolling-1', label: 'Stack' },
  { value: 'debug', icon: 'carbon:debug', label: 'Debug' },
  { value: 'docs', icon: 'carbon:book', label: 'Docs' },
]
</script>

<template>
  <DevtoolsLayout
    v-model:active-tab="tab"
    title="Site Config"
    icon="carbon:settings-check"
    :version="data?.version"
    :nav-items="navItems"
    github-url="https://github.com/harlan-zw/nuxt-site-config"
    :loading="loading || !stack.length"
    @refresh="refresh"
  >
    <div v-if="tab === 'config'" class="animate-fade-up">
      <DevtoolsKeyValue :items="configItems" striped />
    </div>
    <div v-if="tab === 'stack'" class="space-y-5 animate-fade-up">
      <DevtoolsSection v-for="(s, key) in stack" :key="key">
        <template #text>
          <h3 class="text-base font-semibold text-[var(--color-text)]">
            {{ s._context }}
          </h3>
        </template>
        <template #description>
          <DevtoolsMetric :value="s._priority || 0" label="priority" icon="carbon:chart-bar" />
        </template>
        <DevtoolsKeyValue :items="stackItems(s)" />
      </DevtoolsSection>
    </div>
    <div v-else-if="tab === 'debug'" class="animate-fade-up">
      <DevtoolsSnippet :code="JSON.stringify(data, null, 2)" lang="json" label="Runtime Config" />
    </div>
    <div v-else-if="tab === 'docs'" class="h-full max-h-full overflow-hidden">
      <DevtoolsDocs url="https://nuxtseo.com/site-config" />
    </div>
  </DevtoolsLayout>
</template>
