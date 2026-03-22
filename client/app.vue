<script setup lang="ts">
import type { SiteConfigInput } from '../packages/site-config/src'
import { computed, ref, useHead } from '#imports'
import { colorMode } from './composables/rpc'
import { loadShiki, useRenderCodeHighlight } from './composables/shiki'
import { data, refreshSources } from './composables/state'

await loadShiki()

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

const isDark = computed(() => colorMode.value === 'dark')
useHead({
  htmlAttrs: {
    class: () => isDark.value ? 'dark' : '',
  },
})

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
  <UApp>
    <div class="relative bg-base flex flex-col min-h-screen">
      <div class="gradient-bg" />

      <!-- Header -->
      <header class="header glass sticky top-0 z-50">
        <div class="header-content">
          <!-- Logo & Brand -->
          <div class="flex items-center gap-3 sm:gap-4">
            <a
              href="https://nuxtseo.com"
              target="_blank"
              class="flex items-center opacity-90 hover:opacity-100 transition-opacity"
            >
              <NuxtSeoLogo class="h-6 sm:h-7" />
            </a>

            <div class="divider" />

            <div class="flex items-center gap-2">
              <div class="brand-icon">
                <UIcon name="carbon:settings-check" class="text-base sm:text-lg" />
              </div>
              <h1 class="text-sm sm:text-base font-semibold tracking-tight text-[var(--color-text)]">
                Site Config
              </h1>
              <UBadge
                v-if="data?.version"
                color="neutral"
                variant="subtle"
                size="xs"
                class="font-mono text-[10px] sm:text-xs hidden sm:inline-flex"
              >
                {{ data.version }}
              </UBadge>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="flex items-center gap-1 sm:gap-2">
            <!-- Nav Tabs -->
            <div class="nav-tabs">
              <button
                v-for="item of navItems"
                :key="item.value"
                type="button"
                class="nav-tab"
                :class="[tab === item.value ? 'active' : '']"
                @click="tab = item.value"
              >
                <UTooltip :text="item.label" :delay-duration="300">
                  <div class="nav-tab-inner">
                    <UIcon
                      :name="item.icon"
                      class="text-base sm:text-lg"
                      :class="tab === item.value ? 'text-[var(--seo-green)]' : ''"
                    />
                    <span class="nav-label">{{ item.label }}</span>
                  </div>
                </UTooltip>
              </button>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1">
              <UTooltip text="Refresh" :delay-duration="300">
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="carbon:reset"
                  class="nav-action"
                  @click="refresh"
                />
              </UTooltip>

              <UTooltip text="GitHub" :delay-duration="300">
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="simple-icons:github"
                  to="https://github.com/harlan-zw/nuxt-site-config"
                  target="_blank"
                  class="nav-action hidden sm:flex"
                />
              </UTooltip>
            </div>
          </nav>
        </div>
      </header>

      <!-- Main Content -->
      <div class="main-content">
        <main class="mx-auto flex flex-col w-full max-w-7xl">
          <div v-if="!stack.length || loading" class="flex items-center justify-center py-20">
            <UIcon name="carbon:circle-dash" class="text-2xl animate-spin text-[var(--color-text-muted)]" />
          </div>
          <template v-else>
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
              <iframe src="https://nuxtseo.com/site-config" class="w-full h-full border-none" style="min-height: calc(100vh - 100px);" />
            </div>
          </template>
        </main>
      </div>
    </div>
  </UApp>
</template>

<style>
/* Header */
.header {
  border-bottom: 1px solid var(--color-border);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 1rem;
  max-width: 80rem;
  margin: 0 auto;
  width: 100%;
}

@media (min-width: 640px) {
  .header-content {
    padding: 0.75rem 1.25rem;
  }
}

.divider {
  width: 1px;
  height: 1.25rem;
  background: var(--color-border);
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-sm);
  background: oklch(65% 0.2 145 / 0.12);
  color: var(--seo-green);
}

/* Navigation tabs */
.nav-tabs {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  padding: 0.25rem;
  border-radius: var(--radius-md);
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border-subtle);
}

.nav-tab {
  position: relative;
  border-radius: var(--radius-sm);
  transition: background 150ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 150ms cubic-bezier(0.22, 1, 0.36, 1);
}

.nav-tab-inner {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  font-weight: 500;
}

@media (min-width: 640px) {
  .nav-tab-inner {
    padding: 0.375rem 0.75rem;
  }
}

.nav-tab:hover .nav-tab-inner {
  color: var(--color-text);
}

.nav-tab.active {
  background: var(--color-surface-elevated);
  box-shadow: 0 1px 3px oklch(0% 0 0 / 0.08);
}

.dark .nav-tab.active {
  box-shadow: 0 1px 3px oklch(0% 0 0 / 0.3);
}

.nav-tab.active .nav-tab-inner {
  color: var(--color-text);
}

.nav-label {
  display: none;
}

@media (min-width: 640px) {
  .nav-label {
    display: inline;
  }
}

.nav-action {
  color: var(--color-text-muted) !important;
}

.nav-action:hover {
  color: var(--color-text) !important;
  background: var(--color-surface-sunken) !important;
}

/* Main content wrapper */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  min-height: calc(100vh - 60px);
}

@media (min-width: 640px) {
  .main-content {
    padding: 1rem;
  }
}

/* Base HTML */
html {
  font-family: var(--font-sans);
  overflow-y: scroll;
  overscroll-behavior: none;
}

body {
  min-height: 100vh;
}

html.dark {
  color-scheme: dark;
}
</style>
