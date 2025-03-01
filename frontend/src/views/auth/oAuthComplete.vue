<template>
  <div v-loading="loading" class="main"></div>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from "element-plus";

const router = useRouter()
const store = useStore()

const loading = ref(true)
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const userId = urlParams.get('userId')
const redirectTo = localStorage.getItem('loginRedirect') || '/';

onBeforeMount(() => {
  if (token && userId) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    store.commit('setLogin', userId)
    router.push(redirectTo)
    ElMessage.success('授权登录成功')
  }
  else{
    router.push('/')
    ElMessage.error('授权登录错误')
  }
})
</script>

<style scoped>
.main{
  width: 100vw;
  height: 100vh;
}
</style>