import { tryUseNuxt, useLogger, useNuxt } from '@nuxt/kit'
import type { AssertionModes, ModuleAssertion, SiteConfig } from './type'
import { useSiteConfig } from './init'

export function requireSiteConfig(context: string, requirements: Partial<Record<keyof SiteConfig, string>>, modes: Partial<Record<AssertionModes, boolean>>) {
  const nuxt = tryUseNuxt()
  if (!nuxt)
    return
  const assertions: Partial<Record<Partial<AssertionModes>, ModuleAssertion[]>> = nuxt._siteConfigAsserts || {}
  Object.keys(modes).forEach((mode) => {
    const key = mode as AssertionModes
    if (!modes[key])
      return
    assertions[key] = assertions[key] || []
    assertions[key]!.push({ context, requirements })
  })
  nuxt._siteConfigAsserts = assertions
}

export async function assertSiteConfig(mode: AssertionModes, options?: { throwError?: boolean; logErrors?: boolean }) {
  const siteConfig = await useSiteConfig()
  const nuxt = useNuxt()
  let valid = true
  const messages: string[] = []
  const logger = useLogger('nuxt-site-config')

  const assertions: ModuleAssertion[] | false = nuxt._siteConfigAsserts?.[mode] || false
  if (!assertions)
    return { valid, messages }
  assertions.forEach(({ context, requirements }) => {
    Object.keys(requirements).forEach((k) => {
      const key = k as keyof SiteConfig
      if (!siteConfig[key]) {
        const msg = `\`${context}\` requires \`${key}\` to be set. ${requirements[key]}`
        messages.push(msg)
        if (options?.logErrors !== false)
          logger.error(msg)
        valid = false
      }
    })
  })
  if (!valid && options?.throwError !== false)
    throw new Error(`Missing site config for ${mode} mode.`)
  return {
    valid,
    messages,
  }
}
