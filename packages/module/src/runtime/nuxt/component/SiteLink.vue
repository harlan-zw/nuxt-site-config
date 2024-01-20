<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import type { CreateSitePathResolverOptions } from '../../types'
import type { NuxtLinkProps } from '#app'
import { createSitePathResolver, resolveComponent } from '#imports'

const props = defineProps<CreateSitePathResolverOptions & NuxtLinkProps>()

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
