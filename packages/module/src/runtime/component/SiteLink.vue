<script lang="ts" setup>
import { toRefs } from 'vue'
import { createSitePathResolver } from '../composables/utils'
import type { CreateSitePathResolverOptions } from '../types'

const props = defineProps<{
  to: string
} & CreateSitePathResolverOptions>()

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
