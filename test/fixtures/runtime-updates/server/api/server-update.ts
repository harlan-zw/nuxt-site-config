import { defineEventHandler } from 'h3'
import { getSiteConfig } from '#site-config/server'
import { serverInput } from '../utils/inputs'

export default defineEventHandler((e) => {
  const siteConfig = getSiteConfig(e)
  const identity = { ...siteConfig.identity }
  const identityFrozen = Object.isFrozen(siteConfig.identity)
  // a consumer that writes into a nested site config value
  siteConfig.identity.name = 'Written by a consumer'
  return {
    identity,
    identityFrozen,
    input: serverInput,
    inputFrozen: Object.isFrozen(serverInput) || Object.isFrozen(serverInput.identity),
  }
})
