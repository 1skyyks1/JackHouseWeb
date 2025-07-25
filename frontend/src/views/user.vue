<template>
  <div>
    <navMenu></navMenu>
    <el-row justify="center">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-card class="profile-card" shadow="never">
          <div class="profile-header">
            <el-avatar :size="120" :src="userInfo.avatar" />
            <h2 class="username">{{ userInfo.user_name }}</h2>
          </div>
          <el-divider />
          <el-descriptions :title="t('user.info.info')" :column="dynamicColumn" label-width="9rem" border>
            <el-descriptions-item :label="t('user.info.uid')" :span="3">
              {{ userInfo.user_id }}
            </el-descriptions-item>
            <el-descriptions-item :label="t('user.info.osuUid')" :span="1">
              {{ userInfo.osu_uid }}
            </el-descriptions-item>
            <el-descriptions-item :label="t('user.info.osuPage')" :span="2">
              <el-link :href="osuPage(userInfo.osu_uid)" target="_blank">
                {{ osuPage(userInfo.osu_uid) }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item :label="t('user.info.regTime')" :span="1">
              {{ formatDate(userInfo.created_time) }}
            </el-descriptions-item>
            <el-descriptions-item :label="t('user.info.status')" :span="1">
              <el-tag :type="getStatusTagType(userInfo.status)">
                {{ getStatus(userInfo.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="t('user.info.role')" :span="1">
              <el-tag :type="getRoleTagType(userInfo.role)">
                {{ getRole(userInfo.role) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import navMenu from '../components/navmenu.vue'
import { useRoute } from "vue-router";
import { userById } from "@/api/user"
import { reactive, onBeforeMount, computed } from "vue";
import { dayjs } from "element-plus";
import { useBreakpoints } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute()
const userId = route.params.user_id

const userInfo = reactive({})

const getUserInfo = () => {
  userById(userId).then(response => {
    Object.assign(userInfo, response.data)
  })
}

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD');
}

const breakpoints = useBreakpoints({
  tablet: 768,
  laptop: 992,
  desktop: 1200,
});

const isMobile = breakpoints.smaller('tablet');
const isTablet = breakpoints.between('tablet', 'laptop');

const dynamicColumn = computed(() => {
  if (isMobile.value) return 1;
  if (isTablet.value) return 2;
  return 3;
});

const osuPage = (osuUid) => {
  return 'https://osu.ppy.sh/users/' + osuUid
}

const getRole = (role) => {
  switch (role) {
    case 0:
      return t('user.info.roleName.user');
    case 1:
      return t('user.info.roleName.org');
    case 2:
      return t('user.info.roleName.admin');
    default:
      return 'Error';
  }
}

const getRoleTagType = (role) => {
  switch (role) {
    case 0:
      return 'default';
    case 1:
      return 'primary';
    case 2:
      return 'success';
    default:
      return 'danger';
  }
}

const getStatus = (status) => {
  switch (status) {
    case 0:
      return t('user.info.statusName.active');
    case 1:
      return t('user.info.statusName.restricted');
    case 2:
      return t('user.info.statusName.banned');
    default:
      return 'Error';
  }
}

// 根据状态返回对应的 Tag 类型
const getStatusTagType = (status) => {
  switch (status) {
    case 0:
      return 'success';
    case 1:
      return 'warning';
    case 2:
      return 'danger';
    default:
      return 'danger';
  }
}

onBeforeMount(() => {
  getUserInfo()
})

</script>

<style scoped>
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
}

.username {
  margin: 0;
  font-size: 1.5rem;
}
</style>