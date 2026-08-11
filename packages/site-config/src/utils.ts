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
