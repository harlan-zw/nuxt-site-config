/**
 * `toValue` without importing `vue`.
 *
 * Site config values are refs, computeds, getters or plain values, so resolving
 * one needs `toValue` — but importing it from `vue` costs the whole framework.
 * `vue` re-exports it from `@vue/runtime-dom`, so a single named import pulls
 * `@vue/runtime-dom` + `@vue/runtime-core` (~246 KB) into whatever graph asks
 * for it. On the server that graph is a Nitro plugin, which on a Cloudflare
 * Worker is evaluated at cold start, before the isolate can answer any request:
 * the renderer, the scheduler and the component system all initialise so that
 * one pure function can unwrap a value.
 *
 * `@vue/reactivity` is where `toValue` actually lives and is a tenth the size,
 * but `vue` reaches it through `@vue/runtime-dom` rather than depending on it
 * directly, so importing it here would make every consumer install a peer.
 * Nine lines is a better trade than that.
 *
 * `__v_isRef` is the same marker Vue's own `isRef` reads, and it is how every
 * other library in the ecosystem (VueUse's `unref`, for one) recognises a ref
 * without a hard dependency on Vue.
 */
export function toValue<T>(source: T | (() => T) | { __v_isRef?: true, value: T }): T {
  if (typeof source === 'function')
    return (source as () => T)()
  if (source && (source as { __v_isRef?: true }).__v_isRef === true)
    return (source as { value: T }).value
  return source as T
}

const NUXT_SITE_PREFIX = 'NUXT_SITE_'
const NUXT_PUBLIC_SITE_PREFIX = 'NUXT_PUBLIC_SITE_'

export function envSiteConfig(env: Record<string, any> = {}): Record<string, any> {
  const config: Record<string, any> = {}
  for (const key of Object.keys(env)) {
    const prefixLength = key.startsWith(NUXT_SITE_PREFIX)
      ? NUXT_SITE_PREFIX.length
      : key.startsWith(NUXT_PUBLIC_SITE_PREFIX)
        ? NUXT_PUBLIC_SITE_PREFIX.length
        : 0
    if (!prefixLength)
      continue
    const segments = key.slice(prefixLength).split('_')
    let configKey = segments[0]!.toLowerCase()
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i]!
      configKey += segment[0]?.toUpperCase() + segment.slice(1).toLowerCase()
    }
    config[configKey] = env[key]
  }
  return config
}
