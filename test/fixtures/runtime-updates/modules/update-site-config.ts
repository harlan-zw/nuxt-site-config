import { defineNuxtModule } from '@nuxt/kit'
import { updateSiteConfig } from '../../../../packages/module/src/kit'

// A build-time update without a `_context`, as a user or module would write it.
export default defineNuxtModule({
  meta: { name: 'update-site-config' },
  setup() {
    updateSiteConfig({ description: 'Set at build time' })
  },
})
