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
const nitroManifest = JSON.parse(await readFile(new URL('.output/nitro.json', import.meta.url), 'utf8'))
const nitroServer = await readFile(new URL('.output/server/_libs/@nuxt/nitro-server.mjs', import.meta.url), 'utf8')

assert.equal(nitroManifest.versions.nitro, '3.0.260610-beta')
assert.doesNotMatch(nitroServer, /nitropack\/runtime/)

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

    const response = await fetch(`${origin}/spa`, {
      signal: AbortSignal.timeout(1_000),
    }).catch(() => null)
    if (response?.ok)
      return response

    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Nuxt 5 server did not start')
}

try {
  const response = await waitForServer()
  const html = await response.text()

  assert.match(html, /window\.__NUXT_SITE_CONFIG__=/)
  assert.match(html, /Nuxt 5 Route Site/)
  assert.match(html, /nuxt5\.example\.com/)

  const ssrHtml = await fetch(origin).then(response => response.text())
  assert.doesNotMatch(ssrHtml, /window\.__NUXT_SITE_CONFIG__=/)

  const siteResponse = await fetch(`${origin}/api/site`).then(response => response.json())
  assert.equal(siteResponse.config.name, 'Nuxt 5 SPA')
  assert.equal(siteResponse.config.url, 'https://nuxt5.example.com')
  assert.equal(siteResponse.nitroOrigin, `${origin}/`)
  assert.equal(siteResponse.rule.site.name, 'Nuxt 5 Route Site')
}
finally {
  server.kill()
  if (server.exitCode === null)
    await new Promise(resolve => server.once('exit', resolve))
}
