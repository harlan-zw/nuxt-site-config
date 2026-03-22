<script lang="ts" setup>
import type { VueCreateSitePathResolverOptions } from '../../types'
import { computed, resolveComponent, toRef } from 'vue'
import { createSitePathResolver } from '../composables/utils'

const { canonical, absolute, withBase, ...props } = defineProps<{
  canonical?: boolean
  absolute?: boolean
  withBase?: boolean
  /**
   * Route Location the link should navigate to when clicked on.
   */
  to?: string
  /**
   * An alias for `to`. If used with `to`, `href` will be ignored
   */
  href?: string
  /**
   * Forces the link to be considered as external (true) or internal (false). This is helpful to handle edge-cases
   */
  external?: boolean
  /**
   * Where to display the linked URL, as the name for a browsing context.
   */
  target?: '_blank' | '_parent' | '_self' | '_top' | string | null
  /**
   * A rel attribute value to apply on the link. Defaults to "noopener noreferrer" for external links.
   */
  rel?: 'noopener' | 'noreferrer' | 'nofollow' | 'sponsored' | 'ugc' | string | null
  /**
   * If set to true, no rel attribute will be added to the link
   */
  noRel?: boolean
  /**
   * A class to apply to links that have been prefetched.
   */
  prefetchedClass?: string
  /**
   * When enabled will prefetch middleware, layouts and payloads of links in the viewport.
   */
  prefetch?: boolean
  /**
   * Escape hatch to disable `prefetch` attribute.
   */
  noPrefetch?: boolean
}>()

const resolverOptions: VueCreateSitePathResolverOptions = {
  canonical: toRef(() => canonical),
  absolute: toRef(() => absolute),
  withBase: toRef(() => withBase),
}

const linkResolver = createSitePathResolver(resolverOptions)

const NuxtLink = resolveComponent('NuxtLink')

const resolvedTo = computed(() => {
  const _to = props.to as string | undefined
  if (!_to)
    return undefined
  return linkResolver(_to)
})
</script>

<template>
  <NuxtLink v-bind="props" :to="resolvedTo" :aria-label="props.to || props.href">
    <slot />
  </NuxtLink>
</template>
