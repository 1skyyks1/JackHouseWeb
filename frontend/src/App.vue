<template>
  <div id="app">
    <AuroraBackground>
      <div class="main-content-wrapper px-2">
        <RouterView></RouterView>
        <el-backtop :right="20" :bottom="40" />
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