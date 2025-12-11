import type { HighlighterCore } from 'shiki'
import type { Ref, ShallowRef, WritableComputedRef } from 'vue'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import { computed, ref, toValue } from 'vue'
import { devtools } from './rpc'

type MaybeRef<T = any> = T | Ref<T> | ShallowRef<T> | WritableComputedRef<T>

export const shiki = ref<HighlighterCore>()

export async function loadShiki() {
  // Only loading when needed
  shiki.value = await createHighlighterCore({
    themes: [
      import('@shikijs/themes/vitesse-light'),
      import('@shikijs/themes/vitesse-dark'),
    ],
    langs: [
      import('@shikijs/langs/json'),
    ],
    engine: createJavaScriptRegexEngine(),
  })
  return shiki.value
}

export function renderCodeHighlight(code: MaybeRef<string>, lang: 'json') {
  return computed(() => {
    const colorMode = devtools.value?.colorMode || 'light'
    return shiki.value!.codeToHtml(toValue(code), {
      lang,
      theme: colorMode === 'dark' ? 'vitesse-dark' : 'vitesse-light',
    }) || ''
  })
}
