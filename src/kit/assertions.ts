import { useLogger } from '@nuxt/kit'
import type { SiteConfig, SiteConfigInput } from '../type'
import { useSiteConfig } from './init'

type AssertionModes = 'prerender' | 'generate' | 'build'
interface ModuleAssertion { context: string; requirements: Partial<Record<keyof SiteConfigInput, string>> }
const siteConfigAssertions: Partial<Record<Partial<AssertionModes>, ModuleAssertion[]>> = {}

export function requireSiteConfig(context: string, requirements: Partial<Record<keyof SiteConfig, string>>, modes: Partial<Record<AssertionModes, boolean>>) {
  Object.keys(modes).forEach((mode) => {
    const key = mode as AssertionModes
    if (!modes[key])
      return
    siteConfigAssertions[key] = siteConfigAssertions[key] || []
    siteConfigAssertions[key]!.push({ context, requirements })
  })
}

export async function assertSiteConfig(mode: AssertionModes, options?: { throwError?: boolean; logErrors?: boolean }) {
  let valid = true
  const messages: string[] = []
  const logger = useLogger('nuxt-site-config')
  const assertions = siteConfigAssertions[mode]
  if (!assertions)
    return { valid, messages }
  const siteConfig = await useSiteConfig()
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
