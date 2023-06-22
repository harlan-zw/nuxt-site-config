import { defu } from 'defu'
import type { SiteConfigContainer, SiteConfigInput } from '../../type'
import { normalizeSiteConfig } from './'

export function createSiteConfigContainer(): SiteConfigContainer {
  const stack: Partial<SiteConfigInput>[] = []

  function push(input: SiteConfigInput) {
    stack.push(input)
  }

  function get() {
    let mergedStack: SiteConfigInput = {}
    for (const o of stack)
      mergedStack = defu(o, mergedStack)
    // merge all the configs
    // const config: SiteConfigInput = defu(mergedStack, input.runtimeConfig || {}, input.contextConfig || {})
    return normalizeSiteConfig(mergedStack)
  }

  return {
    push,
    get,
  }
}
