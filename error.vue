<script setup>
import { navigateTo } from '#app'
import { useRuntimeConfig } from '#imports'

import errorImage from './assets/images/404.svg?raw'

const { notFoundRedirectUrl } = useRuntimeConfig()

// 如果配置了重定向URL，则进行重定向
if (notFoundRedirectUrl) {
  navigateTo(notFoundRedirectUrl, { external: true })
}
</script>

<template>
  <NuxtLayout name="default">
    <a
      class="w-full h-full max-w-[600px] mx-auto flex items-center justify-center [&_svg]:w-full"
      href="/"
      v-html="errorImage"
    />
  </NuxtLayout>
</template>
