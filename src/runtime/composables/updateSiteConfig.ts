import type {
  MaybeComputedRefEntries,
  SiteConfigContainer,
  SiteConfigInput,
} from '../../type'
import { unref, useNuxtApp, useRequestEvent } from '#imports'

export function updateSiteConfig(input: MaybeComputedRefEntries<SiteConfigInput> = {}) {
  // need to unref overrides fully
  const unrefdInput = unref(input)
  for (const k of Object.keys(unrefdInput)) {
    // @ts-expect-error untyped
    unrefdInput[k] = unref(unrefdInput[k])
  }
  const resolvedInput = unrefdInput as SiteConfigInput

  if (process.server) {
    const container = useRequestEvent().context.siteConfig
    container.push(resolvedInput)
    return
  }

  const container = useNuxtApp().$siteConfig as SiteConfigContainer
  container.push(resolvedInput)
}
