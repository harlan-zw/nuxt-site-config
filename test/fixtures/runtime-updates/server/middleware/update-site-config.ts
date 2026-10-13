import { defineEventHandler } from 'h3'
import { updateSiteConfig } from '#site-config/server'
import { serverInput } from '../utils/inputs'

export default defineEventHandler((e) => {
  if (e.path.startsWith('/api/server-update'))
    updateSiteConfig(e, serverInput)
})
