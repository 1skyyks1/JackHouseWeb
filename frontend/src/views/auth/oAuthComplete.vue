<template>
  <div v-loading="loading" class="main"></div>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { userUpdate } from '@/api/user.js'
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
const { t } = useI18n()

const router = useRouter()
const store = useStore()

const loading = ref(true)
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const userId = urlParams.get('userId')
const redirectTo = localStorage.getItem('loginRedirect') || '/';

const thirdName = urlParams.get('name')
const thirdAvatar = urlParams.get('avatar')

onBeforeMount(async () => {
  if (token && userId) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    store.commit('setLogin', userId)

    if(thirdName || thirdAvatar){
      try {
        const confirm = await ElMessageBox.confirm(
            t('login.syncPrompt', { name: thirdName }),
            t('login.syncTitle'),
            {
              confirmButtonText: t('login.syncYes'),
              cancelButtonText: t('login.syncNo'),
              type: 'warning',
              closeOnClickModal: false,
              closeOnPressEscape: false,
              distinguishCancelAndClose: true
            }
        )
        if(confirm === 'confirm'){
          // 选择同步
          await userUpdate(userId, {
            user_name: thirdName,
            avatar: thirdAvatar,
          })
          ElMessage.success(t('login.syncSuccess'))
        } else {
          ElMessage.info(t('login.syncSkipped'))
        }
      } catch(err) {
        ElMessage.info(t('login.syncSkipped'))
      }
    }

    await router.push(redirectTo)
    ElMessage.success(t('menu.message.loginSuccess'))
  }
  else{
    await router.push('/')
  }
})
</script>

<style scoped>
.main{
  width: 100vw;
  height: 100vh;
}
</style>

