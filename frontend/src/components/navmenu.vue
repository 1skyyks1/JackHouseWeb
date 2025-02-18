<template>
  <el-menu router
           :default-active="route.path"
           mode="horizontal"
           class="nav-menu"
           :ellipsis="false">
    <div class="avatar">
      <img alt="logo" src="../assets/pic/jackhouse.svg" />
    </div>
    <div class="flex-grow"/>
    <el-menu-item index="/" class="menu-item">首页</el-menu-item>
    <el-menu-item index="/forum" class="menu-item">论坛</el-menu-item>
    <el-menu-item index="/pack" class="menu-item">叠包</el-menu-item>
    <el-menu-item>
      <div class="darkModeSvg">
        <svg
            v-if="!isDark"
            @click="toggleDarkMode"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
          <circle cx="12" cy="12" r="5" />
          <path
              d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
        <svg
            v-else
            @click="toggleDarkMode"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </div>
    </el-menu-item>
    <el-menu-item>
      <el-dropdown>
        <el-avatar shape="square" :src="avatar"/>
        <template #dropdown>
          <el-dropdown-menu>
            <div>
              <el-dropdown-item v-if="isLogged && userName"> {{ userName }} </el-dropdown-item>
              <el-dropdown-item v-else @click="goLogin">登录</el-dropdown-item>
            </div>
            <el-dropdown-item v-if="isLogged && userId" @click="goUserInfo">个人资料</el-dropdown-item>
            <el-dropdown-item v-if="role === 1 || role === 2" @click="goAdmin">管理后台</el-dropdown-item>
            <el-dropdown-item divided v-if="isLogged">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useDark, useToggle } from "@vueuse/core";
import { computed, onBeforeMount, ref } from "vue";
import { userById } from "@/api/user"
import router from "@/router";
import { useStore } from 'vuex'

const route = useRoute();
const isDark = useDark();

const store = useStore();
const isLogged = computed(() => store.state.isLogged);

const userId = ref(localStorage.getItem('userId'))
const userName = ref(null)
const avatar = ref(null)
const role = ref(0)

const toggleDarkMode = () => {
  useToggle(isDark)();
};

const getUserInfo = (userId) => {
  userById(userId).then(response => {
    userName.value = response.data.user_name;
    avatar.value = response.data.avatar;
    role.value = response.data.role;
  })
}

const goLogin = () => {
  router.push({ path: '/login' })
}

const goUserInfo = () => {
  router.push({ path: `/user/${userId.value}` })
}

const goAdmin = () => {
  router.push(({ path: '/admin/dashboard' }))
}

onBeforeMount(() => {
  if(userId.value){
    getUserInfo(userId.value);
  }
})

</script>

<style scoped>
.flex-grow {
  flex-grow: 1;
}
.nav-menu {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
}
.darkModeSvg{
  justify-content: center;
  align-items: center;
  display: flex;
}
.avatar{
  padding: 0 15px 0 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.menu-item{
  padding: 0 30px;
}
</style>
