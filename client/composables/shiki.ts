import type { HighlighterCore } from 'shiki'
import type { Ref } from 'vue'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import { computed, ref, toValue } from 'vue'

export const shiki = ref<HighlighterCore>()

// eslint-disable-next-line ts/explicit-function-return-type
export async function loadShiki() {
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

// eslint-disable-next-line ts/explicit-function-return-type
export function useRenderCodeHighlight(code: Ref<string> | string, lang: 'json') {
  return computed(() => {
    return shiki.value!.codeToHtml(toValue(code) || '', {
      lang,
      themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
    }) || ''
  })
}
