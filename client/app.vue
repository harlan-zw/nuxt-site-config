<script setup lang="ts">
import 'floating-vue/dist/style.css'
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
  <div class="relative n-bg-base flex flex-col">
    <header class="sticky top-0 z-2 px-4 pt-4">
      <div class="flex justify-between items-start" mb2>
        <div class="flex space-x-5">
          <h1 text-xl flex items-center gap-2>
            <NIcon icon="carbon:settings-check" class="text-blue-300" />
            Site Config <NBadge class="text-sm">
              {{ data?.version }}
            </NBadge>
          </h1>
        </div>
        <div class="flex items-center space-x-3 text-xl">
          <fieldset
            class="n-select-tabs flex flex-inline flex-wrap items-center border n-border-base rounded-lg n-bg-base"
          >
            <label
              v-for="(value, idx) of ['config', 'stack', 'debug', 'docs']"
              :key="idx"
              class="relative n-border-base hover:n-bg-active cursor-pointer"
              :class="[
                idx ? 'border-l n-border-base ml--1px' : '',
                value === tab ? 'n-bg-active' : '',
              ]"
            >
              <div v-if="value === 'config'" :class="[value === tab ? '' : 'op35']">
                <VTooltip>
                  <div class="px-5 py-2">
                    <h2 text-lg flex items-center>
                      <NIcon icon="carbon:settings opacity-50" />
                    </h2>
                  </div>
                  <template #popper>
                    Site Config
                  </template>
                </VTooltip>
              </div>
              <div v-else-if="value === 'stack'" :class="[value === tab ? '' : 'op35']">
                <VTooltip>
                  <div class="px-5 py-2">
                    <h2 text-lg flex items-center>
                      <NIcon icon="carbon:stacked-scrolling-1 opacity-50" />
                      <NBadge class="text-sm">
                        {{ stack.length }}
                      </NBadge>
                    </h2>
                  </div>
                  <template #popper>
                    Stack
                  </template>
                </VTooltip>
              </div>
              <div v-else-if="value === 'debug'" :class="[value === tab ? '' : 'op35']">
                <VTooltip>
                  <div class="px-5 py-2">
                    <h2 text-lg flex items-center>
                      <NIcon icon="carbon:debug opacity-50" />
                    </h2>
                  </div>
                  <template #popper>
                    Debug
                  </template>
                </VTooltip>
              </div>
              <div v-else-if="value === 'docs'" :class="[value === tab ? '' : 'op35']">
                <VTooltip>
                  <div class="px-5 py-2">
                    <h2 text-lg flex items-center>
                      <NIcon icon="carbon:book opacity-50" />
                    </h2>
                  </div>
                  <template #popper>
                    Documentation
                  </template>
                </VTooltip>
              </div>
              <input
                v-model="tab"
                type="radio"
                :value="value"
                :title="value"
                class="absolute cursor-pointer pointer-events-none inset-0 op-0.1"
              >
            </label>
          </fieldset>
          <VTooltip>
            <button text-lg="" type="button" class="n-icon-button n-button n-transition n-disabled:n-disabled" @click="refresh">
              <NIcon icon="carbon:reset" class="group-hover:text-green-500" />
            </button>
            <template #popper>
              Refresh
            </template>
          </VTooltip>
        </div>
        <div class="items-center space-x-3 hidden lg:flex">
          <div class="opacity-80 text-sm">
            <NLink href="https://github.com/sponsors/harlan-zw" target="_blank">
              <NIcon icon="carbon:favorite" class="mr-[2px]" />
              Sponsor
            </NLink>
          </div>
          <div class="opacity-80 text-sm">
            <NLink href="https://github.com/harlan-zw/nuxt-site-config" target="_blank">
              <NIcon icon="logos:github-icon" class="mr-[2px]" />
              Submit an issue
            </NLink>
          </div>
          <a href="https://nuxtseo.com" target="_blank" class="flex items-end gap-1.5 font-semibold text-xl dark:text-white font-title">
            <NuxtSeoLogo />
          </a>
        </div>
      </div>
    </header>
    <div class="flex-row flex p4 h-full" style="min-height: calc(100vh - 64px);">
      <main class="mx-auto flex flex-col w-full bg-white dark:bg-black dark:bg-dark-700 bg-light-200 ">
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
                <div v-if="data.config._context && key in data.config._context" class="opacity-40">
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
          <div v-else-if="tab === 'debug'" class="h-full max-h-full overflow-hidden">
            <OSectionBlock>
              <template #text>
                <h3 class="opacity-80 text-base mb-1">
                  <NIcon icon="carbon:settings" class="mr-1" />
                  Runtime Config
                </h3>
              </template>
              <div class="px-3 py-2 space-y-5">
                <pre of-auto h-full text-sm style="white-space: break-spaces;" v-html="renderCodeHighlight(JSON.stringify(data, null, 2), 'json').value" />
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
</template>
