import { useLogger } from '@nuxt/kit'
import type { SiteConfig } from './type'
import { useSiteConfig } from './init'

/**
 * @deprecated No longer used
 */
export function requireSiteConfig() {
}

export async function assertSiteConfig(context: string, requirements: Partial<Record<keyof SiteConfig, string>>, options?: { throwError?: boolean; logErrors?: boolean }) {
  const siteConfig = useSiteConfig()
  let valid = true
  const messages: string[] = []
  const logger = useLogger('nuxt-site-config')
  Object.keys(requirements).forEach((k) => {
    const key = k as keyof SiteConfig
    if (!siteConfig[key]) {
      const msg = `\`${context}\` requires \`${key}\` to be set. ${requirements[key]}`
      messages.push(msg)
      valid = false
    }
  })
  if (!valid) {
    if (options?.logErrors)
      logger.error(messages.join('\n'))
    else if (options?.throwError)
      // eslint-disable-next-line unicorn/error-message
      throw new Error(messages.join('\n'))
  }
  return {
    valid,
    messages,
  }
}
