import type { MaybeRef } from '@vueuse/core'
import type { BuiltinLanguage, Highlighter } from 'shiki'
import { getHighlighter } from 'shiki'
import { computed, ref, unref } from 'vue'
import { devtools } from './rpc'

export const shiki = ref<Highlighter>()

export function loadShiki() {
  // Only loading when needed
  return getHighlighter({
    themes: [
      'vitesse-dark',
      'vitesse-light',
    ],
    langs: [
      'css',
      'javascript',
      'typescript',
      'html',
      'vue',
      'vue-html',
      'bash',
      'diff',
    ],
  }).then((i) => {
    shiki.value = i
  })
}

export function renderCodeHighlight(code: MaybeRef<string>, lang: BuiltinLanguage) {
  return computed(() => {
    const colorMode = devtools.value?.colorMode || 'light'
    return shiki.value!.codeToHtml(unref(code), {
      lang,
      theme: colorMode === 'dark' ? 'vitesse-dark' : 'vitesse-light',
    }) || ''
  })
}
