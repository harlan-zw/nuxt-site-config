<script lang="ts" setup>
import { useSiteConfig } from '#imports'

const siteConfig = await useSiteConfig({
  name: 'My site',
  url: 'https://example.com',
})
</script>
<template>
  <div>
    Site name is now {{ siteConfig.name }}, the URL is {{ siteConfig.url }}
  </div>
</template>
