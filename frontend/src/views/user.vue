<template>
  <div>
    <navMenu></navMenu>
    {{ userId }}
  </div>
</template>

<script setup>
import navMenu from '../components/navmenu.vue'
import { useRoute } from "vue-router";

const route = useRoute()
const userId = route.params.user_id


</script>

<style scoped>

</style>