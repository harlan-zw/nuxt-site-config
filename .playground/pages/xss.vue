<script lang="ts" setup>
if (process.server) {
  updateSiteConfig({
    xss: '<\/script><script>alert("xss")<\/script>',
  })
}
</script>

<template>
  <div>xss</div>
</template>
