import { resolve } from 'node:path'
import { startSubprocess } from '@nuxt/devtools-kit'
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { defineNuxtConfig } from 'nuxt/config'
import NuxtSitConfig from '../packages/module/src/module'

const resolver = createResolver(import.meta.url)

process.env.playground = true

export default defineNuxtConfig({
  modules: [
    NuxtSitConfig,
    '@nuxt/ui',
    '@nuxtjs/i18n',
    /**
     * Start a sub Nuxt Server for developing the client
     *
     * The terminal output can be found in the Terminals tab of the devtools.
     */
    defineNuxtModule({
      setup(_, nuxt) {
        if (!nuxt.options.dev)
          return

        const subprocess = startSubprocess(
          {
            command: 'npx',
            args: ['nuxi', 'dev', '--port', '3030'],
            cwd: resolve(__dirname, '../client'),
          },
          {
            id: 'nuxt-site-config:client',
            name: 'Nuxt Site Config Client Dev',
          },
        )
        subprocess.getProcess().stdout?.on('data', (data) => {
          console.log(` sub: ${data.toString()}`)
        })

        process.on('exit', () => {
          subprocess.terminate()
        })

        // process.getProcess().stdout?.pipe(process.stdout)
        // process.getProcess().stderr?.pipe(process.stderr)
      },
    }),
  ],

  nitro: {
    plugins: [
      '~/server/plugin/site-config',
    ],
    typescript: {
      internalPaths: true,
    },
  },

  runtimeConfig: {
    public: {
      site: {
        bar: 'baz',
      },
    },
  },

  site: {
    foo: '<\/script><script>alert("xss")<\/script>',
    debug: true,
  },

  i18n: {
    langDir: 'locales/',
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        file: resolver.resolve('locales/en-US.json'),
      },
      {
        code: 'fr',
        iso: 'fr-FR',
        file: resolver.resolve('locales/fr-FR.json'),
      },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
  },

  compatibilityDate: '2024-11-03',
})
