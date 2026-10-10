<script lang="ts" setup>
import { useHead, useRoute, withSiteUrl } from '#imports'

const route = useRoute()
const url = withSiteUrl(route.path, { withBase: true })
useHead({
  link: [{ rel: 'canonical', href: url }],
  meta: [{ property: 'og:url', content: url }],
})
</script>

<template>
  <div>page</div>
</template>
