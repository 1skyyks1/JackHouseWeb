<template>
  <div v-loading="loading" class="main"></div>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
const { t } = useI18n()

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
    ElMessage.success(t('menu.message.loginSuccess'))
  }
  else{
    router.push('/')
  }
})
</script>

<style scoped>
.main{
  width: 100vw;
  height: 100vh;
}
</style>

