import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cp, mkdtemp, readFile, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Prerender from a copy outside the repository. The repository `.nuxtrc`
// installs this module by name, so Nuxt inlines every module path that
// contains `nuxt-site-config`, which includes the whole checkout. That hides
// a server runtime the prerender build would otherwise load without bundling.
const fixture = import.meta.dirname
const root = await mkdtemp(join(tmpdir(), 'site-generate-'))

try {
  for (const entry of ['app', 'server', 'nuxt.config.ts', 'package.json'])
    await cp(join(fixture, entry), join(root, entry), { recursive: true })
  await symlink(join(fixture, 'node_modules'), join(root, 'node_modules'), 'junction')

  const result = spawnSync(join(fixture, 'node_modules/.bin/nuxt'), ['generate'], {
    cwd: root,
    env: { ...process.env, NUXT_TEST_BASE_URL: '/base/' },
    stdio: 'inherit',
  })
  assert.equal(result.status, 0, 'nuxt generate failed')

  const html = await readFile(join(root, '.output/public/index.html'), 'utf8')
  assert.match(html, /Nuxt 5 SPA/)
  assert.match(html, /https:\/\/nuxt5\.example\.com\/alias-proof/)
}
finally {
  await rm(root, { recursive: true, force: true })
}
