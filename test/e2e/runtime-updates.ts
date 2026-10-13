import { $fetch } from '@nuxt/test-utils'
import { expect, it } from 'vitest'

const HTML_ENTITIES: Record<string, string> = { '&quot;': '"', '&#39;': '\'', '&amp;': '&', '&lt;': '<', '&gt;': '>' }

async function fetchAppReport() {
  const html = await $fetch<string>('/app-update')
  const json = html.match(/<pre id="report">(.*?)<\/pre>/s)?.[1] || 'null'
  return JSON.parse(json.replace(/&(?:quot|#39|amp|lt|gt);/g, entity => HTML_ENTITIES[entity]!))
}

// Shared by the debug and non-debug fixtures: each request repeats twice to catch cross-request leaks.
export function describeRuntimeUpdates() {
  it('lets a consumer write into the nested identity from nuxt.config', async () => {
    for (let i = 0; i < 2; i++) {
      const res = await $fetch<any>('/api/config-identity')
      expect(res.identity).toEqual({ type: 'Person', name: 'Harlan' })
      // a build-time updateSiteConfig() without a `_context`
      expect(res.description).toBe('Set at build time')
    }
  })

  it('applies a server updateSiteConfig() without touching its input', async () => {
    for (let i = 0; i < 2; i++) {
      const res = await $fetch<any>('/api/server-update')
      expect(res.identity).toEqual({ type: 'Organization', name: 'Server Org' })
      expect(res.identityFrozen).toBe(false)
      expect(res.input).toEqual({ identity: { type: 'Organization', name: 'Server Org' } })
      expect(res.inputFrozen).toBe(false)
    }
  })

  it('applies an app updateSiteConfig() without touching its input', async () => {
    for (let i = 0; i < 2; i++) {
      const report = await fetchAppReport()
      expect(report.identity).toEqual({ type: 'Organization', name: 'App Org' })
      expect(report.identityFrozen).toBe(false)
      expect(report.input).toEqual({ identity: { type: 'Organization', name: 'App Org' } })
      expect(report.inputFrozen).toBe(false)
    }
  })
}
