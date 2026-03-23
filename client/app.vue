<script setup lang="ts">
import type { SiteConfigInput } from '../packages/site-config/src'
import { computed, ref, useRenderCodeHighlight } from '#imports'
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

const config = computed(() => {
  const _config = { ...data.value?.config || {} }
  delete _config._context
  delete _config._priorities
  return Object.entries(_config)
})

function normaliseSiteConfigInput(_input: Partial<SiteConfigInput>) {
  const input = { ..._input }
  delete input._priority
  delete input._context
  return input
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
    <div v-if="tab === 'config'" class="space-y-3 animate-fade-up">
      <div v-for="([key, value]) in config" :key="key" class="w-full grid grid-cols-12 items-center gap-3 py-2 px-3 border-b border-[var(--color-border-subtle)]">
        <div class="col-span-2 text-sm font-medium text-[var(--color-text-muted)]">
          {{ key }}
        </div>
        <div class="col-span-7">
          <OCodeBlock :lines="false" class="max-h-[350px] min-h-full overflow-y-auto" :code="JSON.stringify(value, null, 2)" lang="json" />
        </div>
        <div v-if="data?.config._context && key in data.config._context" class="col-span-3 text-xs text-[var(--color-text-subtle)]">
          {{ data.config._context[key] }}
        </div>
      </div>
    </div>
    <div v-if="tab === 'stack'" class="space-y-5 animate-fade-up">
      <OSectionBlock v-for="(s, key) in stack" :key="key">
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
        <div class="px-3 py-2 space-y-5">
          <OCodeBlock class="max-h-[350px] min-h-full overflow-y-auto" :code="JSON.stringify(normaliseSiteConfigInput(s), null, 2)" lang="json" />
        </div>
      </OSectionBlock>
    </div>
    <div v-else-if="tab === 'debug'" class="animate-fade-up">
      <OSectionBlock>
        <template #text>
          <h3 class="text-base font-semibold text-[var(--color-text)]">
            <UIcon name="carbon:settings" class="mr-1" />
            Runtime Config
          </h3>
        </template>
        <div class="px-3 py-2 space-y-5">
          <pre class="overflow-auto h-full text-sm" style="white-space: break-spaces;" v-html="useRenderCodeHighlight(JSON.stringify(data, null, 2), 'json').value" />
        </div>
      </OSectionBlock>
    </div>
    <div v-else-if="tab === 'docs'" class="h-full max-h-full overflow-hidden">
      <DevtoolsDocs url="https://nuxtseo.com/site-config" />
    </div>
  </DevtoolsLayout>
</template>
