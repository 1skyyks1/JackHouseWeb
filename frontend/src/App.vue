<template>
  <div id="app">
    <div class="main-content-wrapper px-2">
      <RouterView></RouterView>
    </div>
  </div>
</template>

<script>

export default {
  name: 'App',
}
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