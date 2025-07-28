<template>
  <div id="app">
    <AuroraBackground>
      <div class="main-content-wrapper px-2">
        <RouterView></RouterView>
      </div>
    </AuroraBackground>
  </div>
</template>

<script>
import AuroraBackground from "@/components/ui/AuroraBackground.vue";

export default {
  name: 'App',
  components: {AuroraBackground},
}
</script>

<style>
/*#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}*/
body {
  font-family: Manrope, sans-serif;
  margin: 0;
}
.main-content-wrapper {
  padding-top: 70px;
}
html, body {
  overflow-x: hidden;
}
</style>