import { defineEventHandler } from 'h3'
import { getSiteConfig } from '#site-config/server'

export default defineEventHandler((e) => {
  const siteConfig = getSiteConfig(e)
  const identity = { ...siteConfig.identity }
  // a consumer that writes into the nested identity from nuxt.config
  siteConfig.identity.name = 'Written by a consumer'
  return {
    identity,
    description: siteConfig.description,
  }
})
