<script setup lang="ts">
import { useSiteConfig } from '#site-config/app'
import { withSiteUrl } from '#site-config/app/composables/utils'
const site = useSiteConfig()
const path = withSiteUrl('/alias-proof')
</script>

<template>
  <main>{{ site.name }}:{{ path }}</main>
</template>
