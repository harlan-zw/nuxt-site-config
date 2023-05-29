<script lang="ts" setup>
// we need to intercept the `to` property and make sure that we have the right trailing slash
import { computed, createInternalLinkResolver, defineProps } from '#imports'

const props = defineProps({
  to: {
    type: String,
    required: true,
  },
})

const linkResolver = createInternalLinkResolver()

const to = computed(() => {
  // only for relative links
  if (props.to !== '/' && props.to.startsWith('/'))
    return linkResolver(props.to)
  return props.to
})

const attrs = computed(() => {
  return {
    ...props,
    to: to.value,
  }
})
</script>

<template>
  <NuxtLink v-bind="{ ...$attrs, ...attrs }">
    <slot />
  </NuxtLink>
</template>
