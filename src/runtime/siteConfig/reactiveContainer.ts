import { defu } from 'defu'
import type { Ref } from 'vue'
import { ref, shallowRef, unref, watch, watchEffect } from 'vue'
import type { MaybeComputedRefEntries, SiteConfigInput, SiteConfigReactiveContainer } from '../../type'
import { normalizeSiteConfig } from './'

/**
 * @todo support reactivity
 */
export function createReactiveSiteConfigContainer(): SiteConfigReactiveContainer {
  let count = 0
  const stack: Ref<Partial<SiteConfigInput & { _id: number }>[]> = shallowRef([])

  function push(input: MaybeComputedRefEntries<SiteConfigInput>) {
    const unrefdInput: SiteConfigInput = {}
    // need to unref overrides fully
    const unrefdOverrides = unref(input)
    for (const k of Object.keys(unrefdOverrides)) {
      // @ts-expect-error untyped
      unrefdInput[k] = unref(unrefdOverrides[k])
    }
    const id = count++
    function cleanUp() {
      stack.value = stack.value.filter(o => o._id !== id)
    }
    stack.value.push({ ...unrefdInput, _id: id })
    // push changes
    watch(() => unrefdInput, (input) => {
      cleanUp()
      push(input)
    }, {
      deep: true,
    })
    // clean up
    return cleanUp
  }

  function get() {
    const siteConfig = ref({})
    watchEffect(() => {
      const inputs = stack.value
      let mergedStack: SiteConfigInput = {}
      for (const o of inputs)
        mergedStack = defu(o, mergedStack)
      siteConfig.value = normalizeSiteConfig(mergedStack)
    })
    return siteConfig
  }

  return {
    push,
    get,
  }
}
