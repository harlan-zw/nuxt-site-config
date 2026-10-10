import { getSiteConfig } from '#site-config/server'
import { defineEventHandler } from 'nuxt/server'

export default defineEventHandler(event => getSiteConfig(event))
