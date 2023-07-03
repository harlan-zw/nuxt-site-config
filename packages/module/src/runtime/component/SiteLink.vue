<script lang="ts" setup>
// we need to intercept the `to` property and make sure that we have the right trailing slash
import { createSitePathResolver, toRefs } from '#imports'

const props = defineProps<{
  to: string
  withBase?: boolean
  absolute?: boolean
}>()

// make props refs
const propRefs = toRefs(props)

const linkResolver = createSitePathResolver({ withBase: propRefs.withBase, absolute: propRefs.absolute })

const to = linkResolver(propRefs.to)
</script>

<template>
  <NuxtLink :to="to">
    <slot />
  </NuxtLink>
</template>
