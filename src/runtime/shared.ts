import type * as Process from 'node:process'
import { withHttp, withHttps } from 'ufo'
import defu from 'defu'
import type { SiteConfig, SiteConfigInput } from '../type'

let _siteConfigOverrides: ({ id: number } & SiteConfigInput)[] = []

const processShim = typeof process !== 'undefined' ? process : {} as typeof Process
const envShim = processShim.env || {}

export const SITE_CONFIG_ENV: SiteConfigInput = {
  name: envShim.NUXT_PUBLIC_SITE_NAME,
  url: envShim.NUXT_PUBLIC_SITE_URL,
  description: envShim.NUXT_PUBLIC_SITE_DESCRIPTION,
  image: envShim.NUXT_PUBLIC_SITE_IMAGE,
  index: envShim.NUXT_PUBLIC_SITE_INDEX,
  titleSeparator: envShim.NUXT_PUBLIC_SITE_TITLE_SEPARATOR,
  trailingSlash: envShim.NUXT_PUBLIC_SITE_TRAILING_SLASH,
  language: envShim.NUXT_PUBLIC_SITE_LANGUAGE,
}

const NITRO_ENV_URL = [
  envShim.NUXT_PUBLIC_VERCEL_URL, // vercel
  envShim.NUXT_PUBLIC_URL, // netlify
  envShim.NUXT_PUBLIC_CF_PAGES_URL, // cloudflare pages
]

let overrideCount = 0

export function stackSiteConfigOverrides(overrides: SiteConfigInput = {}) {
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

export function createSiteConfigContainer() {
  const cleanUps: (() => void)[] = []

  function setOverrides(overrides?: SiteConfigInput) {
    if (Object.keys(overrides || {}).length > 0)
      cleanUps.push(stackSiteConfigOverrides(overrides))
  }

  function compute(input: { runtimeConfig?: SiteConfigInput; contextConfig?: SiteConfigInput }) {
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
    const finalOverrides: SiteConfigInput = {}
    for (const o of _siteConfigOverrides)
      Object.assign(finalOverrides, o)
    // merge all the configs
    const config: SiteConfigInput = defu(finalOverrides, nitroEnvConfig, input.runtimeConfig || {}, input.contextConfig || {})
    // fix booleans index / trailingSlash
    if (typeof config.index !== 'undefined')
      config.index = String(config.index) !== 'false'
    else
      config.index = envShim.PROD
    if (typeof config.trailingSlash !== 'undefined')
      config.trailingSlash = String(config.trailingSlash) !== 'false'
    // ensure a protocol is set
    if (config.url && !config.url.startsWith('http'))
      config.url = config.url.includes('localhost') ? withHttp(config.url) : withHttps(config.url)

    return config as SiteConfig
  }

  return {
    setOverrides,
    cleanUp() {
      cleanUps.forEach(c => c())
    },
    compute,
  }
}
