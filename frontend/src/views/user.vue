<template>
  <div>
    <navMenu></navMenu>
    {{ userId }}
  </div>
</template>

<script setup>
import navMenu from '../components/navmenu.vue'
import { useRoute } from "vue-router";
import { userById } from "@/api/user"
import { reactive, onBeforeMount } from "vue";

const route = useRoute()
const userId = route.params.user_id

const userInfo = reactive({})

const getUserInfo = () => {
  userById(userId).then(response => {
    Object.assign(userInfo, response.data)
  })
}

onBeforeMount(() => {
  getUserInfo()
})

</script>

<style scoped>

</style>