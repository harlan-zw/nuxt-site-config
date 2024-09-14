<script lang="ts" setup>
import type { CreateSitePathResolverOptions } from '../../types'
import { createSitePathResolver, resolveComponent } from '#imports'
import { computed, toRefs } from 'vue'

const props = defineProps<CreateSitePathResolverOptions & {
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

// make props refs
const propRefs = toRefs(props)

const linkResolver = createSitePathResolver(propRefs as any as CreateSitePathResolverOptions)

const NuxtLink = resolveComponent('NuxtLink')

const to = computed(() => {
  const _to = props.to as string | undefined
  if (!_to)
    return undefined
  return linkResolver(_to)
})
</script>

<template>
  <NuxtLink v-bind="$props" :to="to">
    <slot />
  </NuxtLink>
</template>
