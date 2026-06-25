<script setup lang="ts">
import { computed, useSiteConfig } from '#imports'

const siteConfig = useSiteConfig()
const serialized = computed(() => JSON.stringify(siteConfig))
</script>

<template>
  <pre data-site-config>{{ serialized }}</pre>
</template>
