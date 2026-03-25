<script lang="ts" setup>
const siteConfig = useSiteConfig()
const { data: serverConfig } = await useFetch('/api/site-config')
</script>

<template>
  <div>
    <h2>Client-Side Site Config</h2>
    <p>Site URL: {{ siteConfig.url }}</p>
    <p>Site Name: {{ siteConfig.name }}</p>

    <h2>Server-Side Site Config</h2>
    <pre>{{ JSON.stringify(serverConfig, null, 2) }}</pre>
  </div>
</template>
