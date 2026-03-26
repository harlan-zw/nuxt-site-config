<script setup lang="ts">
import { computed, ref } from '#imports'
import { useSiteConfigData } from './composables/state'

await loadShiki()

const tab = ref('config')
const { data, status, refresh } = useSiteConfigData()

const stack = computed(() => {
  return (data.value?.stack || []).toReversed()
})

const siteName = computed(() => {
  return String(data.value?.config?.name || 'Site Name')
})

const titleSeparator = computed(() => {
  return data.value?.config?.titleSeparator ?? '|'
})

const defaultLocale = computed(() => {
  return String(data.value?.config?.defaultLocale || '')
})

const locales = computed(() => {
  const raw = data.value?.config?.locales
  if (!raw || typeof raw !== 'object')
    return null
  return Object.entries(raw as Record<string, { url?: string, name?: string, description?: string }>)
    .map(([code, locale]) => ({
      code,
      url: locale?.url,
      name: locale?.name,
      description: locale?.description,
      isDefault: code === defaultLocale.value,
    }))
})

const envVariant = computed<'success' | 'warning' | 'info'>(() => {
  const env = data.value?.config?.env
  if (env === 'production')
    return 'success'
  if (env === 'staging')
    return 'warning'
  return 'info'
})

const configKeyOrder = ['url', 'name', 'description', 'trailingSlash']
const excludedKeys = new Set(['locales', 'titleSeparator', 'env', 'indexable', 'defaultLocale'])

const config = computed(() => {
  return Object.entries(data.value?.config || {})
    .filter(([key]) => !key.startsWith('_') && !excludedKeys.has(key))
    .sort(([a], [b]) => {
      const aIdx = configKeyOrder.indexOf(a)
      const bIdx = configKeyOrder.indexOf(b)
      if (aIdx >= 0 && bIdx >= 0)
        return aIdx - bIdx
      if (aIdx >= 0)
        return -1
      if (bIdx >= 0)
        return 1
      return a.localeCompare(b)
    })
    .map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''),
      mono: true,
      copyable: true,
      code: typeof value === 'object' ? 'json' as const : undefined,
    }))
})

function localeHref(url: string) {
  return url.startsWith('http') ? url : `https://${url}`
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
    module-name="nuxt-site-config"
    title="Site Config"
    icon="carbon:settings-check"
    :version="data?.version"
    :nav-items="navItems"
    :loading="status === 'pending'"
    github-url="https://github.com/harlan-zw/nuxt-site-config"
    @refresh="refresh"
  >
    <!-- Config Tab -->
    <div v-if="tab === 'config'" class="stagger-children">
      <DevtoolsAlert variant="info">
        Shared site metadata used internally by Nuxt SEO modules.
        Debug resolved values from your
        <code class="font-mono text-xs font-semibold">nuxt.config</code>
        <code class="font-mono text-xs font-semibold">site</code> key,
        environment variables, and hosting provider detection.
      </DevtoolsAlert>

      <!-- Summary metrics -->
      <div class="flex flex-wrap items-center gap-2 px-5 py-3">
        <DevtoolsMetric
          v-if="data?.config?.env"
          icon="carbon:cloud"
          :value="String(data.config.env)"
          :variant="envVariant"
        />
        <DevtoolsMetric
          v-if="data?.config?.indexable !== undefined"
          :icon="data.config.indexable !== false ? 'carbon:checkmark' : 'carbon:close'"
          :value="data.config.indexable !== false ? 'Indexable' : 'Not indexable'"
          :variant="data.config.indexable !== false ? 'success' : 'warning'"
        />
        <DevtoolsMetric
          v-if="locales?.length"
          icon="carbon:translate"
          :value="`${locales.length} locales`"
        />
        <DevtoolsMetric
          v-if="defaultLocale"
          icon="carbon:earth"
          :value="defaultLocale"
          label="default"
        />
      </div>

      <!-- Main config values -->
      <DevtoolsKeyValue :items="config" />

      <!-- Title Separator -->
      <DevtoolsSection icon="carbon:text-short-paragraph" text="Title Separator" :collapse="false">
        <div class="px-4 py-4 space-y-4">
          <div class="rounded-lg overflow-hidden border border-[var(--color-border)]">
            <!-- Browser chrome: tab bar -->
            <div class="flex items-center gap-2.5 bg-[var(--color-surface-sunken)] px-3 py-2">
              <div class="flex gap-1.5" aria-hidden="true">
                <div class="size-2.5 rounded-full" style="background: oklch(65% 0.15 25 / 0.5)" />
                <div class="size-2.5 rounded-full" style="background: oklch(75% 0.15 85 / 0.5)" />
                <div class="size-2.5 rounded-full" style="background: oklch(65% 0.15 145 / 0.5)" />
              </div>
              <div class="flex items-center gap-1.5 bg-[var(--color-surface-elevated)] rounded-md px-3 py-1 text-xs font-medium shadow-sm">
                <span class="text-[var(--color-text)]">Page Title</span>
                <span class="text-[var(--color-text-muted)]">{{ titleSeparator }}</span>
                <span class="text-[var(--color-text)]">{{ siteName }}</span>
              </div>
            </div>
            <!-- Browser chrome: address bar -->
            <div class="bg-[var(--color-surface-elevated)] px-3 py-1.5 border-t border-[var(--color-border-subtle)]">
              <div class="flex items-center gap-2 text-xs text-[var(--color-text-subtle)] bg-[var(--color-surface-sunken)] rounded px-2.5 py-1">
                <UIcon name="carbon:locked" class="text-[10px] shrink-0" aria-hidden="true" />
                example.com/page
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3 text-sm">
            <span class="text-[var(--color-text-muted)]">Character</span>
            <code class="text-base text-[var(--color-text)] bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] px-3 py-0.5 rounded font-mono">{{ titleSeparator }}</code>
          </div>
        </div>
      </DevtoolsSection>

      <!-- Locales -->
      <DevtoolsSection v-if="locales?.length" icon="carbon:translate" text="Locales" :description="`${locales.length} configured`">
        <div class="divide-y divide-[var(--color-border-subtle)]">
          <div v-for="locale in locales" :key="locale.code" class="px-4 py-3 flex items-start gap-3">
            <code class="text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] px-2 py-1 rounded font-mono font-semibold text-[var(--color-text)] shrink-0">{{ locale.code }}</code>
            <div class="min-w-0 flex-1 space-y-0.5">
              <div class="flex items-center gap-2">
                <span v-if="locale.name" class="text-sm text-[var(--color-text)] font-medium">{{ locale.name }}</span>
                <span v-if="locale.isDefault" class="status-enabled text-[10px]">default</span>
              </div>
              <div v-if="locale.description" class="text-xs text-[var(--color-text-muted)] truncate">
                {{ locale.description }}
              </div>
              <a v-if="locale.url" :href="localeHref(locale.url)" target="_blank" rel="noopener" class="link-external text-xs">
                {{ locale.url }}
              </a>
            </div>
          </div>
        </div>
      </DevtoolsSection>
    </div>

    <!-- Stack Tab -->
    <div v-else-if="tab === 'stack'" class="animate-fade-up">
      <DevtoolsAlert variant="info">
        Config resolves by merging sources. Higher priority overrides lower.
      </DevtoolsAlert>

      <div class="space-y-3 py-3 px-1">
        <DevtoolsSection v-for="(s, key) in stack" :key="key">
          <template #text>
            <div class="flex items-center gap-2.5">
              <h3 class="text-sm font-semibold text-[var(--color-text)]">
                {{ s._context }}
              </h3>
              <DevtoolsMetric :value="s._priority || 0" label="priority" />
            </div>
          </template>
          <DevtoolsSnippet :code="JSON.stringify(Object.fromEntries(Object.entries(s).filter(([k]) => !k.startsWith('_'))), null, 2)" lang="json" />
        </DevtoolsSection>
      </div>
    </div>

    <!-- Debug Tab -->
    <div v-else-if="tab === 'debug'" class="animate-fade-up">
      <DevtoolsSection>
        <template #text>
          <h3 class="text-base font-semibold text-[var(--color-text)]">
            <UIcon name="carbon:settings" class="mr-1" aria-hidden="true" />
            Runtime Config
          </h3>
        </template>
        <DevtoolsSnippet :code="JSON.stringify(data, null, 2)" lang="json" />
      </DevtoolsSection>
    </div>

    <!-- Docs Tab -->
    <div v-else-if="tab === 'docs'">
      <DevtoolsDocs url="https://nuxtseo.com/site-config" />
    </div>
  </DevtoolsLayout>
</template>
