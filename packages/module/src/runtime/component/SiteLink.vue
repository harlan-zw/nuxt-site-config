<script lang="ts" setup>
import { toRefs } from 'vue'
import { createSitePathResolver } from '../composables/utils'

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
