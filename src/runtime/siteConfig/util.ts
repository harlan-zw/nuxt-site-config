import type { SiteConfig, SiteConfigInput } from '../../type'

export function normalizeSiteConfig(config: SiteConfigInput & { _id?: number }) {
  // fix booleans index / trailingSlash
  if (typeof config.index !== 'undefined')
    config.index = String(config.index) !== 'false'
  if (typeof config.trailingSlash !== 'undefined')
    config.trailingSlash = String(config.trailingSlash) !== 'false'
  delete config._id
  return config as SiteConfig
}
