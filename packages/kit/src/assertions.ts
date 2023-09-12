import { useLogger } from '@nuxt/kit'
import type { SiteConfig } from './type'
import { useSiteConfig } from './init'

/**
 * @deprecated No longer used
 */
export function requireSiteConfig() {
}

export function assertSiteConfig(module: string, requirements: Partial<Record<keyof SiteConfig, string>>, options?: { throwError?: boolean }) {
  const siteConfig = useSiteConfig()
  let valid = true
  const messages: string[] = []
  const logger = useLogger('nuxt-site-config')
  Object.keys(requirements).forEach((k) => {
    const key = k as keyof SiteConfig
    if (!siteConfig[key]) {
      const reason = (requirements[key] || '').split('\n')
      const msg = [
        `The \`${module}\` module requires a \`site.${key as string}\` to be set:`,
        ...reason.map(r => `  - ${r}`),
        '',
        `You can fix this by adding a \`site.${key as string}\` to your \`nuxt.config\` or a \`NUXT_PUBLIC_SITE_${(key as string).toUpperCase()}\` to your .env. Learn more at https://nuxtseo.com/site-config/getting-started/how-it-works`,
      ]
      messages.push(msg.join('\n'))
      valid = false
    }
  })
  if (!valid) {
    logger.error(messages.join('\n'))
    if (options?.throwError)
      // eslint-disable-next-line unicorn/error-message
      throw new Error()
  }
  return {
    valid,
    messages,
  }
}
