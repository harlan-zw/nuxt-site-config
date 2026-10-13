import { updateSiteConfig, useSiteConfig } from '#site-config/app'
import { defineNuxtPlugin, useRequestURL, useState } from '#imports'

// One object shared by every request, like a config loaded once at startup.
const appInput = {
  identity: {
    type: 'Organization',
    name: 'App Org',
  },
}

export default defineNuxtPlugin({
  enforce: 'pre',
  setup() {
    if (!useRequestURL().pathname.startsWith('/app-update'))
      return
    updateSiteConfig(appInput)
    const siteConfig = useSiteConfig()
    const identity = { ...siteConfig.identity }
    const identityFrozen = Object.isFrozen(siteConfig.identity)
    // a consumer that writes into a nested site config value
    siteConfig.identity.name = 'Written by a consumer'
    useState('site-config-report', () => ({
      identity,
      identityFrozen,
      input: appInput,
      inputFrozen: Object.isFrozen(appInput) || Object.isFrozen(appInput.identity),
    }))
  },
})
