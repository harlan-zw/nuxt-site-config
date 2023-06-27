import type { SiteConfig, SiteConfigInput } from '../../type'

export function normalizeSiteConfig(config: SiteConfigInput & { _id?: number }) {
  // fix booleans index / trailingSlash
  if (typeof config.indexable !== 'undefined')
    config.indexable = String(config.indexable) !== 'false'
  if (typeof config.trailingSlash !== 'undefined')
    config.trailingSlash = String(config.trailingSlash) !== 'false'
  delete config._id
  return config as SiteConfig
}
