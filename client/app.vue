<script setup lang="ts">
import { computed, ref } from '#imports'
import { useSiteConfigData } from './composables/state'

await loadShiki()

const tab = ref('config')
const { data, status, refresh } = useSiteConfigData()

const stack = computed(() => {
  return (data.value?.stack || []).toReversed()
})

const config = computed(() => {
  return Object.entries(data.value?.config || {})
    .filter(([key]) => !key.startsWith('_'))
    .map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''),
      mono: true,
      copyable: true,
      code: typeof value === 'object' ? 'json' as const : undefined,
    }))
})

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
    :loading="status === 'pending'"
    github-url="https://github.com/harlan-zw/nuxt-site-config"
    @refresh="refresh"
  >
    <div v-if="tab === 'config'" class="animate-fade-up">
      <DevtoolsKeyValue :items="config" />
    </div>

    <div v-else-if="tab === 'stack'" class="space-y-5 animate-fade-up">
      <DevtoolsSection v-for="(s, key) in stack" :key="key">
        <template #text>
          <h3 class="text-base font-semibold text-[var(--color-text)]">
            {{ s._context }}
          </h3>
        </template>
        <template #description>
          <div class="text-xs text-[var(--color-text-muted)]">
            Priority: {{ s._priority || 0 }}
          </div>
        </template>
        <DevtoolsSnippet :code="JSON.stringify(Object.fromEntries(Object.entries(s).filter(([k]) => !k.startsWith('_'))), null, 2)" lang="json" />
      </DevtoolsSection>
    </div>

    <div v-else-if="tab === 'debug'" class="animate-fade-up">
      <DevtoolsSection>
        <template #text>
          <h3 class="text-base font-semibold text-[var(--color-text)]">
            <UIcon name="carbon:settings" class="mr-1" />
            Runtime Config
          </h3>
        </template>
        <DevtoolsSnippet :code="JSON.stringify(data, null, 2)" lang="json" />
      </DevtoolsSection>
    </div>

    <div v-else-if="tab === 'docs'">
      <DevtoolsDocs url="https://nuxtseo.com/site-config" />
    </div>
  </DevtoolsLayout>
</template>
