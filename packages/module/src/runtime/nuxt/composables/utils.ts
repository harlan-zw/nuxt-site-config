import type { ComputedRef, MaybeRef, Ref } from 'vue'
import { fixSlashes, resolveSitePath } from 'site-config-stack/urls'
import type { VueCreateSitePathResolverOptions } from '../../types'
import { computed, unref, useNitroOrigin, useRuntimeConfig, useSiteConfig } from '#imports'

export function createSitePathResolver(options: VueCreateSitePathResolverOptions = {}): (path: MaybeRef<string>) => Ref<string> {
  const siteConfig = useSiteConfig()
  const nitroOrigin = useNitroOrigin()
  const nuxtBase = useRuntimeConfig().app.baseURL || '/'
  return (path: MaybeRef<string>) => {
    // don't use any composables within here
    return computed(() => resolveSitePath(unref(path), {
      absolute: unref(options.absolute),
      withBase: unref(options.withBase),
      siteUrl: (unref(options.canonical) !== false || import.meta.prerender) ? siteConfig.url : nitroOrigin,
      trailingSlash: siteConfig.trailingSlash,
      base: nuxtBase,
    }))
  }
}

export function withSiteTrailingSlash(path: MaybeRef<string>): ComputedRef<string> {
  const siteConfig = useSiteConfig()
  return computed(() => fixSlashes(siteConfig.trailingSlash, unref(path)))
}

export function withSiteUrl(path: MaybeRef<string>, options: VueCreateSitePathResolverOptions = {}): ComputedRef<string> {
  const siteConfig = useSiteConfig()
  const nitroOrigin = useNitroOrigin()
  const base = useRuntimeConfig().app.baseURL || '/'
  return computed(() => {
    return resolveSitePath(unref(path), {
      absolute: true,
      siteUrl: (unref(options.canonical) !== false || import.meta.prerender) ? siteConfig.url : nitroOrigin,
      trailingSlash: siteConfig.trailingSlash,
      base,
      withBase: unref(options.withBase),
    })
  })
}
