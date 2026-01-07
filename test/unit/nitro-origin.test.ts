import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getNitroOrigin } from '../../packages/kit/src/util'

describe('getNitroOrigin', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    // Clear all relevant env vars
    delete process.env.NUXT_VITE_NODE_OPTIONS
    delete process.env.__NUXT_DEV__
    delete process.env.NITRO_HOST
    delete process.env.NITRO_PORT
    delete process.env.HOST
    delete process.env.PORT
    delete process.env.NITRO_SSL_CERT
    delete process.env.NITRO_SSL_KEY
    delete process.env.NUXT_SITE_HOST_OVERRIDE
    delete process.env.NUXT_SITE_PORT_OVERRIDE
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('env var priority', () => {
    it('prefers __NUXT_DEV__ over NUXT_VITE_NODE_OPTIONS', () => {
      process.env.__NUXT_DEV__ = JSON.stringify({
        baseURL: 'http://localhost:3000/',
      })
      process.env.NUXT_VITE_NODE_OPTIONS = JSON.stringify({
        baseURL: 'http://localhost:4000/',
      })

      const origin = getNitroOrigin({ isDev: true })
      expect(origin).toBe('http://localhost:3000/')
    })

    it('uses proxy.url over baseURL when available', () => {
      process.env.NUXT_VITE_NODE_OPTIONS = JSON.stringify({
        proxy: { url: 'https://proxy.example.com:3000/' },
        baseURL: 'http://127.0.0.1:3000/',
      })

      const origin = getNitroOrigin({ isDev: true })
      expect(origin).toBe('https://proxy.example.com:3000/')
    })
  })

  describe('host with embedded protocol', () => {
    it('handles host set via NUXT_SITE_HOST_OVERRIDE with protocol', () => {
      process.env.HOST = 'localhost'
      process.env.NUXT_SITE_HOST_OVERRIDE = 'http://example.com'

      const origin = getNitroOrigin({ isDev: false })
      expect(origin).toBe('http://example.com/')
    })

    it('handles https protocol in override', () => {
      process.env.HOST = 'localhost'
      process.env.NUXT_SITE_HOST_OVERRIDE = 'https://secure.example.com'

      const origin = getNitroOrigin({ isDev: false })
      expect(origin).toBe('https://secure.example.com/')
    })
  })

  describe('fallback chain', () => {
    it('returns empty host with default port in dev when no env vars', () => {
      const origin = getNitroOrigin({ isDev: true })
      // empty host triggers https default (line 58-60 check)
      expect(origin).toBe('https://:3000/')
    })

    it('returns empty origin in prod when nothing set', () => {
      const origin = getNitroOrigin({ isDev: false })
      expect(origin).toBe('https:///')
    })

    it('uses HOST before falling back to empty', () => {
      process.env.HOST = 'fallback.host.com'

      const origin = getNitroOrigin({ isDev: false })
      expect(origin).toBe('https://fallback.host.com/')
    })
  })

  describe('dev mode with custom devServer.host', () => {
    it('prefers request host over 127.0.0.1 from env var', () => {
      process.env.NUXT_VITE_NODE_OPTIONS = JSON.stringify({
        baseURL: 'https://127.0.0.1:3000/',
      })

      const origin = getNitroOrigin({
        isDev: true,
        requestHost: 'local.mysite.com:3000',
        requestProtocol: 'https',
      })

      expect(origin).toBe('https://local.mysite.com:3000/')
    })

    it('prefers request host over localhost from env var', () => {
      process.env.NUXT_VITE_NODE_OPTIONS = JSON.stringify({
        baseURL: 'http://localhost:3000/',
      })

      const origin = getNitroOrigin({
        isDev: true,
        requestHost: 'dev.example.com:3000',
        requestProtocol: 'http',
      })

      expect(origin).toBe('https://dev.example.com:3000/')
    })

    it('uses env var when request host is also localhost', () => {
      process.env.NUXT_VITE_NODE_OPTIONS = JSON.stringify({
        baseURL: 'http://localhost:3000/',
      })

      const origin = getNitroOrigin({
        isDev: true,
        requestHost: 'localhost:3000',
        requestProtocol: 'http',
      })

      expect(origin).toBe('http://localhost:3000/')
    })

    it('uses env var when request host is 127.0.0.1', () => {
      process.env.NUXT_VITE_NODE_OPTIONS = JSON.stringify({
        baseURL: 'http://127.0.0.1:3000/',
      })

      const origin = getNitroOrigin({
        isDev: true,
        requestHost: '127.0.0.1:3000',
        requestProtocol: 'http',
      })

      expect(origin).toBe('http://127.0.0.1:3000/')
    })
  })

  describe('prerender mode', () => {
    it('uses env var, ignores request host override logic', () => {
      process.env.NUXT_VITE_NODE_OPTIONS = JSON.stringify({
        baseURL: 'http://127.0.0.1:3000/',
      })

      const origin = getNitroOrigin({
        isDev: false,
        isPrerender: true,
        requestHost: 'custom.host.com:3000',
        requestProtocol: 'https',
      })

      // prerender should use env var, not request host override
      expect(origin).toBe('http://127.0.0.1:3000/')
    })
  })

  describe('production mode', () => {
    it('uses request host when no env var', () => {
      const origin = getNitroOrigin({
        isDev: false,
        requestHost: 'example.com',
        requestProtocol: 'https',
      })

      expect(origin).toBe('https://example.com/')
    })

    it('uses NITRO_HOST env var as fallback', () => {
      process.env.NITRO_HOST = 'prod.example.com'

      const origin = getNitroOrigin({
        isDev: false,
      })

      expect(origin).toBe('https://prod.example.com/')
    })
  })

  describe('protocol detection', () => {
    it('uses https for non-localhost hosts', () => {
      const origin = getNitroOrigin({
        isDev: false,
        requestHost: 'example.com',
      })

      expect(origin).toBe('https://example.com/')
    })

    it('uses http for localhost', () => {
      process.env.HOST = 'localhost'
      process.env.PORT = '3000'

      const origin = getNitroOrigin({
        isDev: true,
      })

      expect(origin).toBe('http://localhost:3000/')
    })

    it('respects NITRO_SSL_CERT and NITRO_SSL_KEY', () => {
      process.env.NITRO_SSL_CERT = '/path/to/cert'
      process.env.NITRO_SSL_KEY = '/path/to/key'
      process.env.HOST = 'localhost'

      const origin = getNitroOrigin({
        isDev: false,
      })

      expect(origin).toBe('https://localhost/')
    })
  })

  describe('host override env vars', () => {
    it('respects NUXT_SITE_HOST_OVERRIDE', () => {
      process.env.NUXT_VITE_NODE_OPTIONS = JSON.stringify({
        baseURL: 'http://127.0.0.1:3000/',
      })
      process.env.NUXT_SITE_HOST_OVERRIDE = 'override.example.com'

      const origin = getNitroOrigin({
        isDev: true,
      })

      // port 3000 is preserved from env var
      expect(origin).toBe('https://override.example.com:3000/')
    })

    it('respects NUXT_SITE_PORT_OVERRIDE', () => {
      process.env.HOST = 'localhost'
      process.env.NUXT_SITE_PORT_OVERRIDE = '8080'

      const origin = getNitroOrigin({
        isDev: true,
      })

      expect(origin).toBe('http://localhost:8080/')
    })
  })
})
