import { withHttp, withHttps } from 'ufo'
import defu from 'defu'
import type { SiteConfig } from '../type'

let _siteConfigOverrides: ({ id: number } & Partial<SiteConfig>)[] = []

export const SITE_CONFIG_ENV: Partial<SiteConfig> = {
  name: import.meta.env.NUXT_PUBLIC_SITE_NAME,
  url: import.meta.env.NUXT_PUBLIC_SITE_URL,
  description: import.meta.env.NUXT_PUBLIC_SITE_DESCRIPTION,
  image: import.meta.env.NUXT_PUBLIC_SITE_IMAGE,
  index: import.meta.env.NUXT_PUBLIC_SITE_INDEX,
  titleSeparator: import.meta.env.NUXT_PUBLIC_SITE_TITLE_SEPARATOR,
  trailingSlash: import.meta.env.NUXT_PUBLIC_SITE_TRAILING_SLASH,
  language: import.meta.env.NUXT_PUBLIC_SITE_LANGUAGE,
}

const NITRO_ENV_URL = [
  import.meta.env.NUXT_PUBLIC_VERCEL_URL, // vercel
  import.meta.env.NUXT_PUBLIC_URL, // netlify
  import.meta.env.NUXT_PUBLIC_CF_PAGES_URL, // cloudflare pages
]

let overrideCount = 0

export function stackSiteConfigOverrides(overrides: Partial<SiteConfig> = {}) {
  const id = overrideCount++
  _siteConfigOverrides.push({
    id,
    ...overrides,
  })
  // clean up
  return () => {
    _siteConfigOverrides = _siteConfigOverrides.filter(o => o.id !== id)
  }
}

export function createSiteConfig(input: { overrides?: Partial<SiteConfig> }) {
  let cleanUp: null | (() => void) = null
  if (Object.keys(input.overrides || {}).length > 0)
    cleanUp = stackSiteConfigOverrides(input.overrides)

  function compute(input: { runtimeConfig?: Partial<SiteConfig>; contextConfig?: Partial<SiteConfig> }) {
    // pull data from the environment variables as documented
    const nitroEnvConfig: Partial<SiteConfig> = {}
    const nitroUrl = NITRO_ENV_URL.find(k => Boolean(k))
    if (nitroUrl)
      nitroEnvConfig.url = nitroUrl
    // check environment based keys first
    for (const k of Object.keys(SITE_CONFIG_ENV) as (keyof SiteConfig)[]) {
      if (SITE_CONFIG_ENV[k])
        // @ts-expect-error not sure
        nitroEnvConfig[k] = SITE_CONFIG_ENV[k]
    }
    const finalOverrides: Partial<SiteConfig> = {}
    for (const o of _siteConfigOverrides)
      Object.assign(finalOverrides, o)
    // merge all the configs
    const config: Partial<SiteConfig> = defu(finalOverrides, nitroEnvConfig, input.runtimeConfig || {}, input.contextConfig || {})
    // fix booleans index / trailingSlash
    if (typeof config.index !== 'undefined')
      config.index = String(config.index) !== 'false'
    else
      config.index = import.meta.env.PROD
    if (typeof config.trailingSlash !== 'undefined')
      config.trailingSlash = String(config.trailingSlash) !== 'false'
    // ensure a protocol is set
    if (config.url && !config.url.startsWith('http'))
      config.url = config.url.includes('localhost') ? withHttp(config.url) : withHttps(config.url)

    return config
  }

  return {
    cleanUp,
    compute,
  }
}
