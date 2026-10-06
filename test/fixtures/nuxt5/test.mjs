import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:net'

const portServer = createServer()
portServer.listen(0, '127.0.0.1')
await once(portServer, 'listening')
const port = portServer.address().port
portServer.close()
await once(portServer, 'close')

const origin = `http://127.0.0.1:${port}`
const requestOrigin = `${origin}${(process.env.NUXT_TEST_BASE_URL || '/base/').replace(/\/$/, '')}`
const nitroManifest = JSON.parse(await readFile(new URL('.output/nitro.json', import.meta.url), 'utf8'))

assert.equal(nitroManifest.versions.nitro, '3.0.260903-beta')

const server = spawn(process.execPath, ['.output/server/index.mjs'], {
  cwd: import.meta.dirname,
  env: {
    ...process.env,
    HOST: '127.0.0.1',
    PORT: String(port),
  },
  stdio: 'inherit',
})

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null)
      throw new Error(`Nuxt 5 server exited with code ${server.exitCode}`)

    const response = await fetch(`${requestOrigin}/spa`, {
      signal: AbortSignal.timeout(1_000),
    }).catch(() => {
      // Startup can refuse connections before the listener is ready.
      return null
    })
    if (response?.ok)
      return response

    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Nuxt 5 server did not start')
}

try {
  const response = await waitForServer()
  const html = await response.text()
  assert.equal(response.headers.get('x-site-name'), 'Nuxt 5 Route Site')

  assert.match(html, /window\.__NUXT_SITE_CONFIG__=/)
  assert.match(html, /Nuxt 5 Route Site/)
  assert.match(html, /nuxt5\.example\.com/)

  const queryResponse = await fetch(`${requestOrigin}/spa?utm=1`)
  assert.equal(queryResponse.headers.get('x-site-name'), 'Nuxt 5 Route Site')
  const fallbackResponse = await fetch(`${requestOrigin}/api/origin`)
  assert.equal(fallbackResponse.status, 200)
  const fallback = await fallbackResponse.json()
  assert.equal(fallback.origin, `${origin}/`)
  assert.equal(fallback.portableOrigin, `${origin}/`)
  assert.equal(fallback.url, `${origin}/pre-init`)
  const proxyFallback = await fetch(`${requestOrigin}/api/origin`, {
    headers: { 'x-forwarded-host': 'proxy.example.com:8443', 'x-forwarded-proto': 'https' },
  }).then(response => response.json())
  assert.equal(proxyFallback.origin, 'https://proxy.example.com:8443/')
  assert.equal(proxyFallback.url, 'https://proxy.example.com:8443/pre-init')
  assert.equal(proxyFallback.portableOrigin, 'https://proxy.example.com:8443/')
  const ipv6Fallback = await fetch(`${requestOrigin}/api/origin`, {
    headers: { 'x-forwarded-host': '[2001:db8::1]:8443', 'x-forwarded-proto': 'https' },
  }).then(response => response.json())
  assert.equal(ipv6Fallback.origin, 'https://[2001:db8::1]:8443/')
  assert.equal(ipv6Fallback.portableOrigin, 'https://[2001:db8::1]:8443/')
  const invalidProtocol = await fetch(`${requestOrigin}/api/origin`, {
    headers: { 'x-forwarded-proto': 'invalid' },
  }).then(response => response.json())
  assert.equal(invalidProtocol.origin, `${origin}/`)
  assert.equal(invalidProtocol.portableOrigin, `${origin}/`)

  const ssrResponse = await fetch(requestOrigin)
  assert.equal(ssrResponse.headers.get('x-site-name'), 'Nuxt 5 SPA')
  const ssrHtml = await ssrResponse.text()
  assert.match(ssrHtml, /https:\/\/nuxt5\.example\.com\/alias-proof/)
  assert.doesNotMatch(ssrHtml, /window\.__NUXT_SITE_CONFIG__=/)

  const siteResponse = await fetch(`${requestOrigin}/api/site`).then(response => response.json())
  assert.equal(siteResponse.aliasUrl, 'https://nuxt5.example.com/alias-proof')
  assert.equal(siteResponse.config.name, 'Nuxt 5 SPA')
  assert.equal(siteResponse.config.url, 'https://nuxt5.example.com')
  assert.equal(siteResponse.nitroOrigin, `${origin}/`)
  const proxyResponse = await fetch(`${requestOrigin}/api/site`, {
    headers: { 'x-forwarded-host': 'proxy.example.com:8443', 'x-forwarded-proto': 'https' },
  }).then(response => response.json())
  assert.equal(proxyResponse.nitroOrigin, 'https://proxy.example.com:8443/')
  const isolatedResponse = await fetch(`${requestOrigin}/api/site`).then(response => response.json())
  assert.equal(isolatedResponse.nitroOrigin, `${origin}/`)
  assert.equal(siteResponse.rule.site.name, 'Nuxt 5 Route Site')
}
finally {
  server.kill()
  if (server.exitCode === null)
    await new Promise(resolve => server.once('exit', resolve))
}
