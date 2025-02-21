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

  <el-dialog v-model="loginOpen" width="400px" align-center>
    <form class="login-form">
      <div class="flex-column"><label>用户名/邮箱 </label></div>
      <div class="inputForm">
        <el-input v-model="loginForm.username" placeholder="输入用户名或邮箱" class="input" :prefix-icon="User"/>
      </div>
      <div class="flex-column"><label>密码 </label></div>
      <div class="inputForm">
        <el-input v-model="loginForm.password" placeholder="输入密码" class="input" type="password" show-password :prefix-icon="Lock"/>
      </div>
      <el-button class="submit-button" plain @click="submitLogin">登录</el-button>
      <el-divider style="margin-bottom: 5px"><span class="else-login">其他登录方式</span></el-divider>
      <div class="else-login">
        <el-button class="osu-button" @click="osuLogin">
          <img src="../assets/pic/osu/osu.svg" width="40" />
        </el-button>
      </div>
    </form>
  </el-dialog>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useDark, useToggle } from "@vueuse/core";
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import { userById } from "@/api/user"
import router from "@/router";
import { useStore } from 'vuex'
import { User, Lock } from '@element-plus/icons-vue'
import { userLogin } from "@/api/login";
import {ElMessage} from "element-plus";

const route = useRoute();
const isDark = useDark();

const store = useStore();
const isLogged = computed(() => store.state.isLogged);
const userId = computed(() => store.state.userId);
const userName = ref(null)
const avatar = ref(null)
const role = ref(0)
const loginOpen = ref(false)
const loginForm = ref({
  username: '',
  password: ''
});

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
  loginOpen.value = true;
}

const osuLogin = () => {
  window.location.href = 'https://api.jackhouse.xyz/auth/osu'
}

const goUserInfo = () => {
  router.push({ path: `/user/${userId.value}` })
}

const goAdmin = () => {
  router.push(({ path: '/admin/dashboard' }))
}

const submitLogin = async () => {
  try{
    await store.dispatch('Login',
        { identifier: loginForm.value.username,
          password: loginForm.value.password
        });
    ElMessage.success('登录成功')
  }
  catch (error) {
    console.log(error)
  }
}

watch(userId, (newUserId) => {
  if (newUserId) {
    getUserInfo(newUserId);
  }
});

onMounted(() => {
  console.log(store.state)
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
.login-form{
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 20px;
}
.submit-button{
  margin: 10px 0 0 0;
}
.else-login{
  display: flex;
  justify-content: center;
}
.osu-button{
  border: none;
  width: 50px;
  height: 50px;
}
</style>
