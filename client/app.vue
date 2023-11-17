<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SiteConfigInput } from '../packages/site-config/src'
import { loadShiki } from './composables/shiki'
import { colorMode } from './composables/rpc'
import { data, refreshSources } from './composables/state'
import { useHead } from '#imports'

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

useHead({
  htmlAttrs: {
    class: () => colorMode.value || '',
  },
})

const stack = computed<Partial<SiteConfigInput>[]>(() => {
  return (data.value?.stack || []).reverse()
})

const config = computed(() => {
  const _config = { ...data.value?.config || {} }
  delete _config._context
  return Object.entries(_config)
})

function normaliseSiteConfigInput(_input: Partial<SiteConfigInput>) {
  const input = { ..._input }
  delete input._priority
  delete input._context
  return input
}
</script>

<template>
  <div class="relative p8 n-bg-base flex flex-col h-screen">
    <div>
      <div class="flex justify-between items-center" mb6>
        <div>
          <h1 text-xl mb2 flex items-center gap-2>
            <NIcon icon="carbon:settings-check" class="text-blue-300" />
            Nuxt Site Config <NBadge class="text-sm">
              {{ data?.runtimeConfig?.version }}
            </NBadge>
          </h1>
          <div class="space-x-3 mt-1 ml-1 opacity-80 text-sm">
            <NLink href="https://nuxtseo.com/site-config" target="_blank">
              <NuxtSeoLogo class="mr-[2px] w-5 h-5 inline" />
              Documentation
            </NLink>
            <NLink href="https://github.com/harlan-zw/nuxt-site-config" target="_blank">
              <NIcon icon="logos:github-icon" class="mr-[2px]" />
              Submit an issue
            </NLink>
          </div>
        </div>
        <div>
          <a href="https://nuxtseo.com" target="_blank" class="flex items-end gap-1.5 font-semibold text-xl dark:text-white font-title">
            <NuxtSeoLogo />
            <span class="hidden sm:block">Nuxt</span><span class="sm:text-green-500 dark:sm:text-green-400">SEO</span>
          </a>
        </div>
      </div>
    </div>
    <div class="mb-6 text-xl">
      <fieldset
        class="n-select-tabs flex flex-inline flex-wrap items-center border n-border-base rounded-lg n-bg-base"
      >
        <label
          v-for="(value, idx) of ['config', 'stack']"
          :key="idx"
          class="relative n-border-base cursor-pointer hover:n-bg-active px-0.5em py-0.1em"
          :class="[
            idx ? 'border-l n-border-base ml--1px' : '',
            value === tab ? 'n-bg-active' : '',
          ]"
        >
          <div v-if="value === 'config'" :class="[value === tab ? '' : 'op35']">
            <div class="px-2 py-1">
              <h2 text-lg flex items-center gap-2 mb-1>
                <NIcon icon="carbon:settings opacity-50" />
                Site Config
              </h2>
              <p text-xs op60>
                The final resolved site config.
              </p>
            </div>
          </div>
          <div v-else-if="value === 'stack'" :class="[value === tab ? '' : 'op35']">
            <div class="px-2 py-1">
              <h2 text-lg flex items-center gap-2 mb-1>
                <NIcon icon="carbon:stacked-scrolling-1 opacity-50" />
                Stack <NBadge class="text-sm">
                  {{ stack.length }}
                </NBadge>
              </h2>
              <p text-xs op60>
                Configs merged to create the resolved config.
              </p>
            </div>
          </div>
          <input
            v-model="tab"
            type="radio"
            :value="value"
            :title="value"
            class="absolute inset-0 op-0.1"
          >
        </label>
      </fieldset>
      <button
        class="ml-5 hover:shadow-lg text-xs transition items-center gap-2 inline-flex border-green-500/50 border-1 rounded-lg shadow-sm px-3 py-1"
        @click="refresh"
      >
        <div v-if="!loading">
          Refresh Data
        </div>
        <NIcon v-else icon="carbon:progress-bar-round" class="animated animate-spin op50 text-xs" />
      </button>
    </div>
    <div>
      <NLoading v-if="!stack || loading" />
      <template v-else>
        <div v-if="tab === 'config'">
          <div class="space-y-3">
            <div v-for="([key, value]) in config" :key="key" class="w-full grid grid-cols-12 items-center space-x-3 py-1.5 px-3 shadow-sm border-t-1 border-t-transparent border-b-1 border-b-gray-200/20">
              <div class="col-span-2 opacity-80">
                {{ key }}
              </div>
              <div class="col-span-7">
                <OCodeBlock :lines="false" class="max-h-[350px] min-h-full overflow-y-auto" :code="JSON.stringify(value, null, 2)" lang="json" />
              </div>
              <div class="opacity-40">
                {{ data.config._context[key] }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="tab === 'stack'" class="space-y-5">
          <OSectionBlock v-for="(s, key) in stack" :key="key">
            <template #text>
              <h3 class="opacity-80 text-base mb-1">
                {{ s._context }}
              </h3>
            </template>
            <template #description>
              <div class="opacity-60 text-xs">
                Priority: {{ s._priority || 0 }}
              </div>
            </template>
            <div class="px-3 py-2 space-y-5">
              <OCodeBlock class="max-h-[350px] min-h-full overflow-y-auto" :code="JSON.stringify(normaliseSiteConfigInput(s), null, 2)" lang="json" />
            </div>
          </OSectionBlock>
        </div>
      </template>
    </div>
    <div class="flex-auto" />
  </div>
</template>
