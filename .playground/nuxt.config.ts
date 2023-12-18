import { resolve } from 'node:path'
import { defineNuxtConfig } from 'nuxt/config'
import { defineNuxtModule } from '@nuxt/kit'
import { startSubprocess } from '@nuxt/devtools-kit'
import NuxtSitConfig from '../packages/module/src/module'

process.env.playground = true

export default defineNuxtConfig({
  modules: [
    NuxtSitConfig,
    '@nuxt/ui',
    'nuxt-icon',
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
          // eslint-disable-next-line no-console
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
        file: 'en-US.json',
      },
      {
        code: 'fr',
        iso: 'fr-FR',
        file: 'fr-FR.json',
      },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
  },
})
