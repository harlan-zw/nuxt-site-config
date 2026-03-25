<script lang="ts" setup>
const siteConfig = useSiteConfig()
</script>

<template>
  <div>
    <h1>Site Config Env-Driven Example</h1>
    <p>Site URL: {{ siteConfig.url }}</p>
    <p>Site Name: {{ siteConfig.name }}</p>
    <p>Copy <code>.env.example</code> to <code>.env</code> and restart to see env-driven overrides.</p>
  </div>
</template>
