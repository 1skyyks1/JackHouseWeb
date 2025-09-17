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
        </el-card>
      </el-col>
    </el-row>
    <el-row justify="center">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-card class="profile-card" shadow="never">
          <div class="post-card-header">
            {{ t('user.info.info') }}
          </div>
          <el-divider />
          <el-descriptions :column="dynamicColumn" label-width="9rem" border>
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
            <el-descriptions-item label="QQ" :span="1">
              <el-button type="text" @click="handleCopy(userInfo.qq)" class="copy-button">
                {{ userInfo.qq }}
              </el-button>
            </el-descriptions-item>
            <el-descriptions-item label="Discord" :span="1">
              <el-button type="text" @click="handleCopy(userInfo.discord)" class="copy-button">
                {{ userInfo.discord }}
              </el-button>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
    <el-row justify="center">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-card class="post-card" shadow="never">
          <div class="post-card-header">
            <span>{{ t('user.info.post') }}<span v-if="postTotal !== 0"> ({{ postTotal }})</span></span>
            <el-pagination
                v-model:current-page="postPage"
                v-model:page-size="postPageSize"
                :page-sizes="[5, 10, 20]"
                size="small"
                :layout="paginationLayout"
                :total="postTotal"
                @current-change="handlePostPageChange"
                :hide-on-single-page="postTotal <= postPageSize"
            />
          </div>
          <el-divider />
          <div v-for="(post, index) in postList" :key="index" class="post-item" @click="goToPost(post.post_id)">
            <div class="post-title">{{ getTitle(post) }}</div>
            <div class="post-info">
              <span class="post-time">{{ formatDate(post.created_time) }}</span>
            </div>
            <el-divider class="post-divider" />
          </div>
          <el-empty :description="t('user.info.noPost', { username: userInfo.user_name })" v-if="postList.length === 0" />
        </el-card>
      </el-col>
    </el-row>
    <el-row justify="center">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-card class="post-card" shadow="never">
          <div class="post-card-header">
            <span>{{ t('user.info.postFile') }}<span v-if="postFileTotal !== 0"> ({{ postFileTotal }})</span></span>
            <el-pagination
                v-model:current-page="postFilePage"
                v-model:page-size="postFilePageSize"
                size="small"
                :layout="paginationLayout"
                :total="postFileTotal"
                @current-change="handlePostFilePageChange"
                :hide-on-single-page="postFileTotal <= postFilePageSize"
            />
          </div>
          <el-divider />
          <div v-for="(file, index) in postFileList" :key="index">
            <div class="post-title">{{ file.file_name }}
              <div class="post-info">
                <el-popover
                    placement="top-start"
                    :width="200"
                    trigger="hover"
                    :content="file.feedback">
                  <template #reference>
                    <el-tag v-if="file.status === 0" type="warning">{{ t('user.info.pending') }}</el-tag>
                    <el-tag v-else-if="file.status === 1" type="success">{{ t('user.info.approved') }}</el-tag>
                    <el-tag v-else type="danger">{{ t('user.info.rejected') }}</el-tag>
                  </template>
                </el-popover>
                <span class="post-time">{{ formatDate(file.created_time) }}</span>
              </div>
            </div>
            <el-divider class="post-divider" />
          </div>
          <el-empty :description="t('user.info.noPostFile', { username: userInfo.user_name })" v-if="postFileList.length === 0" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import navMenu from '../components/navmenu.vue'
import { useRoute } from "vue-router";
import { userById } from "@/api/user"
import { reactive, onBeforeMount, computed, ref } from "vue";
import { dayjs, ElMessage } from "element-plus";
import { useBreakpoints } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { postFileByUserId, postFileDelete } from "@/api/postFile"
import { postByUserId } from "@/api/post";
import router from "@/router";

const { locale, t } = useI18n();
const route = useRoute()
const userId = route.params.user_id

const userInfo = reactive({})
const postList = ref([])
const postPage = ref(1);
const postPageSize = ref(5)
const postTotal = ref(0)

const postFileList = ref([])
const postFilePage = ref(1);
const postFilePageSize = ref(5)
const postFileTotal = ref(0)

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

const paginationLayout = computed(() => {
  if(isMobile.value) return 'prev, next'
  if(isTablet.value) return 'prev, next'
  return 'prev, pager, next'
})

const dynamicColumn = computed(() => {
  if (isMobile.value) return 1;
  if (isTablet.value) return 2;
  return 3;
});

const osuPage = (osuUid) => {
  return 'https://osu.ppy.sh/u/' + osuUid
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

const handleCopy = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success(t('user.info.copy'));
  })
}

const getPostFileByUserId = () => {
  postFileByUserId(userId, postFilePage.value, postFilePageSize.value).then(response => {
    postFileList.value = response.data;
    postFileTotal.value = response.total;
  })
}

const getPostByUserId = () => {
  postByUserId(userId, postPage.value, postPageSize.value).then(response => {
    postList.value = response.data;
    postTotal.value = response.total;
  })
}

const getTitle = (post) => {
  if(locale.value === 'zh'){
    return post.title_zh || post.title_en || "暂无标题 (>_<)";
  }
  else{
    return post.title_en || post.title_zh || "No title available (>_<)";
  }
}

const goToPost = (postId) => {
  router.push(`/post/${postId}`)
}

const handlePostPageChange = (page) => {
  postPage.value = page;
  getPostByUserId()
}

const handlePostFilePageChange = (page) => {
  postFilePage.value = page;
  getPostFileByUserId()
}

onBeforeMount(() => {
  getUserInfo()
  getPostByUserId()
  getPostFileByUserId()
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
.post-card-header {
  font-size: 16px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
}
.el-row {
  margin-bottom: 5px;
}
.el-row:last-child {
  margin-bottom: 0;
}
:deep(.el-divider--horizontal){
  margin: 0.5rem 0;
}
.post-info {
  font-size: 12px;
  align-items: center;
  display: flex;
  justify-content: flex-end;
}
.post-time {
  margin-left: 0.5rem;
}
.post-item {
  cursor: pointer;
}
.post-item:hover{
  transform: scale(1.01);
  transition: all 0.2s ease;
}
.copy-button{
  height: 24px;
}
.delete{
  font-size: 11px;
  margin: 1px 6px 0;
  padding: 0 6px;
}
</style>