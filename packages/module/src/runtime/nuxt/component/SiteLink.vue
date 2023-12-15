<script lang="ts" setup>
import { toRefs } from 'vue'
import type { CreateSitePathResolverOptions } from '../../types'
import { createSitePathResolver } from '#imports'

const props = defineProps<{
  to: string
} & CreateSitePathResolverOptions>()

// make props refs
const propRefs = toRefs(props)

const linkResolver = createSitePathResolver(propRefs as any as CreateSitePathResolverOptions)

const to = linkResolver(propRefs.to)
</script>

<template>
  <NuxtLink :to="to">
    <slot />
  </NuxtLink>
</template>
