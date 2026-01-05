<template>
  <div id="app">
    <div :class="!isHomePage ? 'main-content-wrapper px-2' : ''">
      <RouterView></RouterView>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isHomePage = computed(() => route.path === '/');
</script>

<style>
body {
  font-family: Manrope, sans-serif;
  margin: 0;
}
.main-content-wrapper {
  padding-top: 70px;
}
html, body {
  overflow-x: hidden;
  height: 100%;
}
body, .smooth-container {
  scroll-behavior: smooth;
}
</style>