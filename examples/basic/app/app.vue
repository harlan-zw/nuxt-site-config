<script lang="ts" setup>
const siteConfig = useSiteConfig()
</script>

<template>
  <div>
    <h1>Site Config Basic Example</h1>
    <p>Site URL: {{ siteConfig.url }}</p>
    <p>Site Name: {{ siteConfig.name }}</p>
    <p>This example demonstrates basic site configuration.</p>
  </div>
</template>
