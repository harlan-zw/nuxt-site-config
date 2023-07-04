import type { MaybeRef } from '@vue/reactivity'
import { fixSlashes, resolveSitePath } from 'site-config-stack'
import { computed, unref, useNitroOrigin, useRuntimeConfig, useSiteConfig } from '#imports'

export function createSitePathResolver(options: { canonical?: MaybeRef<boolean>; absolute?: MaybeRef<boolean>; withBase?: MaybeRef<boolean> } = {}) {
  const siteConfig = useSiteConfig()
  const nitroOrigin = useNitroOrigin()
  const nuxtBase = useRuntimeConfig().app.baseURL || '/'
  return (path: MaybeRef<string>) => {
    // don't use any composables within here
    return computed(() => resolveSitePath(unref(path), {
      absolute: unref(options.absolute),
      withBase: unref(options.withBase),
      siteUrl: unref(options.canonical) !== false || process.env.prerender ? siteConfig.url : nitroOrigin,
      trailingSlash: siteConfig.trailingSlash,
      base: nuxtBase,
    }))
  }
}

export function withSiteTrailingSlash(path: MaybeRef<string>) {
  const siteConfig = useSiteConfig()
  return computed(() => {
    return fixSlashes(siteConfig.trailingSlash, unref(path))
  })
}

export function withSiteUrl(path: MaybeRef<string>, options: { canonical?: MaybeRef<boolean>; withBase?: boolean } = {}) {
  const siteConfig = useSiteConfig()
  const nitroOrigin = useNitroOrigin()
  const base = useRuntimeConfig().app.baseURL || '/'
  return computed(() => {
    return resolveSitePath(unref(path), {
      absolute: true,
      siteUrl: unref(options.canonical) !== false || process.env.prerender ? siteConfig.url : nitroOrigin,
      trailingSlash: siteConfig.trailingSlash,
      base,
      withBase: options.withBase,
    })
  })
}
