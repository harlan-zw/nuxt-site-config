<script lang="ts" setup>
import { useSiteConfig } from '#imports'

const siteConfig = useSiteConfig()
</script>
<template>
  <div>
    <div>
      {{ siteConfig }}
    </div>
    Site name is now {{ siteConfig.name }}, the URL is {{ siteConfig.url }}
  </div>
</template>
