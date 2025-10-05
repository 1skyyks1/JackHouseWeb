<template>
  <div>
    <navMenu></navMenu>
    <el-row justify="center" :gutter="10" style="margin-top: 4px; margin-bottom: 10px">
      <el-col :xs="18" :sm="20" :md="12" :lg="14" :xl="14">
        <el-autocomplete v-model="searchKeyword"
                         :fetch-suggestions="querySearchAsync"
                         :placeholder="t('forum.placeholder.search')"
                         @select="handleSelect"
                         debounce="600"
                         :suffix-icon="Search"
                         class="search-input">
          <template #default="{ item }">
            <div v-if="item.isNoResult" class="search-result-item no-result">
              {{ t('forum.noResult') }}
            </div>
            <div v-else class="search-result-item">
              <div class="search-result-title">{{ item.value }}</div>
              <div class="search-result-time">
                {{ formatDate(item.time) }}
              </div>
            </div>
          </template>
        </el-autocomplete>
      </el-col>
      <el-col :xs="6" :sm="4" :md="4" :lg="2" :xl="2">
        <el-button size="large" class="create-button" plain @click="createNewPost">
          <el-icon><Edit /></el-icon>
          <span>{{ t('forum.create') }}</span>
        </el-button>
      </el-col>
    </el-row>

    <el-row justify="center">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-card v-loading="postListLoading" shadow="never" style="margin-bottom: 10px;">
          <el-tabs v-model="activeTab" @tab-change="handleChange" :class="{ 'wide-tabs': !isMobile }">
            <!-- 所有帖子 -->
            <el-tab-pane :name="-1">
              <template #label>
                <span class="custom-tabs-label">
                  <span>{{ t('forum.postType.all') }}</span>
                </span>
              </template>
              <template #default>
                <div>
                  <div v-for="(post, index) in posts" :key="index" class="post-item" @click="goToPost(post.post_id)">
                    <div class="post-title">
                      <span>{{ getTitle(post) }}</span>
                      <el-tag
                          :type="getTagType(post.type)"
                          size="small"
                          effect="plain"
                          class="post-tag"
                      >
                        {{ post.type === 0 ? t('forum.postType.normal') : post.type === 1 ? t('forum.postType.mapRequest') :
                          post.type === 2 ? t('forum.postType.event') :
                              post.type === 3 ? t('forum.postType.announcement') : 'Other' }}
                      </el-tag>
                      <el-tag
                          :type="isSubmissionActive(post.end) ? 'success' : 'danger'"
                          v-if="post.type === 1"
                          size="small"
                          effect="plain"
                          class="post-tag"
                      >
                        {{ isSubmissionActive(post.end) ? t('forum.status.ongoing') : t('forum.status.closed') }}
                      </el-tag>
                    </div>
                    <div class="post-info">
                      <span class="post-username">
                        <el-icon size="14px"><User /></el-icon>
                        <span>{{ post.user_name }}</span>
                      </span>
                      <span class="post-time">{{ formatDate(post.created_time) }}</span>
                    </div>
                    <el-divider />
                  </div>
                </div>
              </template>
            </el-tab-pane>
            <!-- 公告 -->
            <el-tab-pane :name="3">
              <template #label>
                <span class="custom-tabs-label">
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bell" viewBox="0 0 16 16">
                      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
                    </svg>
                  </span>
                  <span>{{ t('forum.postType.announcement') }}</span>
                </span>
              </template>
              <template #default>
                <div>
                  <div v-for="(post, index) in posts" :key="index" class="post-item" @click="goToPost(post.post_id)">
                    <div class="post-title">{{ getTitle(post) }}</div>
                    <div class="post-info">
                      <span class="post-username">
                        <el-icon size="14px"><User /></el-icon>
                        <span>{{ post.user_name }}</span>
                      </span>
                      <span class="post-time">{{ formatDate(post.created_time) }}</span>
                    </div>
                    <el-divider />
                  </div>
                </div>
              </template>
            </el-tab-pane>
            <!-- 活动 -->
            <el-tab-pane :name="2">
              <template #label>
                <span class="custom-tabs-label">
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar2-week" viewBox="0 0 16 16">
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/>
                      <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5zM11 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                  </span>
                  <span>{{ t('forum.postType.event') }}</span>
                </span>
              </template>
              <template #default>
                <div>
                  <div v-for="(post, index) in posts" :key="index" class="post-item" @click="goToPost(post.post_id)">
                    <div class="post-title">{{ getTitle(post) }}</div>
                    <div class="post-info">
                      <span class="post-username">
                        <el-icon size="14px"><User /></el-icon>
                        <span>{{ post.user_name }}</span>
                      </span>
                      <span class="post-time">{{ formatDate(post.created_time) }}</span>
                    </div>
                    <el-divider />
                  </div>
                </div>
              </template>
            </el-tab-pane>
            <!-- 征稿 -->
            <el-tab-pane :name="1">
              <template #label>
                <span class="custom-tabs-label">
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-flag" viewBox="0 0 16 16">
                      <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12 12 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A20 20 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a20 20 0 0 0 1.349-.476l.019-.007.004-.002h.001M14 1.221c-.22.078-.48.167-.766.255-.81.252-1.872.523-2.734.523-.886 0-1.592-.286-2.203-.534l-.008-.003C7.662 1.21 7.139 1 6.5 1c-.669 0-1.606.229-2.415.478A21 21 0 0 0 3 1.845v6.433c.22-.078.48-.167.766-.255C4.576 7.77 5.638 7.5 6.5 7.5c.847 0 1.548.28 2.158.525l.028.01C9.32 8.29 9.86 8.5 10.5 8.5c.668 0 1.606-.229 2.415-.478A21 21 0 0 0 14 7.655V1.222z"/>
                    </svg>
                  </span>
                  <span>{{ t('forum.postType.mapRequest') }}</span>
                </span>
              </template>
              <template #default>
                <div>
                  <div v-for="(post, index) in posts" :key="index" class="post-item" @click="goToPost(post.post_id)">
                    <div class="post-title">
                      <span>{{ getTitle(post) }}</span>
                      <el-tag
                          :type="isSubmissionActive(post.end) ? 'success' : 'danger'"
                          v-if="post.type === 1"
                          size="small"
                          effect="plain"
                          class="post-tag"
                      >
                        {{ isSubmissionActive(post.end) ? t('forum.status.ongoing') : t('forum.status.closed') }}
                      </el-tag>
                    </div>
                    <div class="post-info">
                      <span class="post-username">
                        <el-icon size="14px"><User /></el-icon>
                        <span>{{ post.user_name }}</span>
                      </span>
                      <span class="post-time">{{ formatDate(post.created_time) }}</span>
                    </div>
                    <el-divider />
                  </div>
                </div>
              </template>
            </el-tab-pane>
            <!-- 常规 -->
            <el-tab-pane :name="0">
              <template #label>
                <span class="custom-tabs-label">
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-square-text" viewBox="0 0 16 16">
                      <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2.5a2 2 0 0 0-1.6.8L8 14.333 6.1 11.8a2 2 0 0 0-1.6-.8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5a1 1 0 0 1 .8.4l1.9 2.533a1 1 0 0 0 1.6 0l1.9-2.533a1 1 0 0 1 .8-.4H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                      <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"/>
                    </svg>
                  </span>
                  <span>{{ t('forum.postType.normal') }}</span>
                </span>
              </template>
              <template #default>
                <div>
                  <div v-for="(post, index) in posts" :key="index" class="post-item" @click="goToPost(post.post_id)">
                    <div class="post-title">{{ getTitle(post) }}</div>
                    <div class="post-info">
                      <span class="post-username">
                        <el-icon size="14px"><User /></el-icon>
                        <span>{{ post.user_name }}</span>
                      </span>
                      <span class="post-time">{{ formatDate(post.created_time) }}</span>
                    </div>
                    <el-divider />
                  </div>
                </div>
              </template>
            </el-tab-pane>
          </el-tabs>
          <el-pagination
              style="margin-top: 14px; justify-content: center"
              size="small"
              background
              hide-on-single-page
              layout="prev, pager, next"
              :page-size="postPageSize"
              :total="totalPost"
              @current-change="handlePostListPageChange"
          ></el-pagination>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import navMenu from "@/components/navmenu.vue";
import { ref, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { postSearch, postByType, postList } from "@/api/post";
import router from '@/router/index'
import { Edit, Search } from '@element-plus/icons-vue'
import { dayjs, ElMessage } from 'element-plus'
import { useBreakpoints } from "@vueuse/core";

const { locale, t } = useI18n();
const searchKeyword = ref('');
const page = ref(1);
const pageSize = ref(5)

const postListLoading = ref(true)
const postPage = ref(1)
const postPageSize = ref(8)
const totalPost = ref(0)
const activeTab = ref(-1)
const posts = ref([])

const breakpoints = useBreakpoints({
  tablet: 768,
  laptop: 992,
  desktop: 1200,
});

const isMobile = breakpoints.smaller('tablet');

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD');
}

const getTitle = (post) => {
  if(locale.value === 'zh'){
    return post.title_zh || post.title_en || "暂无标题 (>_<)";
  }
  else{
    return post.title_en || post.title_zh || "No title available (>_<)";
  }
}

const getPostList = () => {
  postListLoading.value = true;
  if(activeTab.value === -1){
    postList(postPage.value, postPageSize.value).then(res => {
      posts.value = res.data;
      totalPost.value = res.total;
      postListLoading.value = false;
    })
  }
  else{
    postByType(activeTab.value, postPage.value, postPageSize.value).then(res => {
      posts.value = res.data;
      totalPost.value = res.total;
      postListLoading.value = false;
    })
  }
}

const handleChange = () => {
  postPage.value = 1;
  postPageSize.value = 8;
  getPostList();
}

const getTagType = (type) => {
  switch (type) {
    case 0: return 'info'
    case 1: return 'primary'
    case 2: return 'success'
    case 3: return 'warning'
    default: return ''
  }
}

const handlePostListPageChange = (newPage) => {
  postPage.value = newPage;
  getPostList();
}

const isSubmissionActive = (endDateStr) => {
  if (!endDateStr) return true;
  const endDate = new Date(endDateStr)
  const now = new Date()
  return now < endDate
}

const querySearchAsync = async (keyword, cb) => {
  if (!keyword) {
    cb([]);
    return;
  }
  try{
    await postSearch(keyword, locale.value, page.value, pageSize.value).then(response => {
      const results = response.data;
      if (results.length === 0) {
        cb([{ isNoResult: true }]);
      } else {
        cb(results);
      }
    }).catch(err => {
      console.log(err)
    })
  } catch (error) {
    console.error('搜索失败', error);
    cb([]);
  }
}

const handleSelect = (item) => {
  if (item.isNoResult) {
    return;
  }
  router.push(`/post/${item.post_id}`);
};

const createNewPost = () => {
  router.push('/forum/editor')
}

const goToPost = (postId) => {
  router.push(`/post/${postId}`)
}

onBeforeMount(() => {
  getPostList();
})
</script>

<style scoped>
.el-card{
  margin-bottom: 10px;
}
:deep(.el-card__body){
  padding: 10px 20px 20px;
}
.search-result-item.no-result {
  color: #999;
  text-align: center;
  padding: 10px 0;
  pointer-events: none;
  cursor: default;
}
.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 2px 0;
}
.search-result-title {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.search-result-time {
  font-size: 12px;
  color: #999;
  margin-left: 16px;
  flex-shrink: 0;
}
:deep(.el-input .el-input__wrapper){
  height: 38px;
  border-radius: 7px;
  margin-top: 1px;
}
:deep(.el-input .el-input__inner){
  padding: 0 6px;
}
:deep(.el-input .el-input__suffix){
  padding-right: 6px;
}
:deep(.el-card__header){
  padding: 10px 20px;
}
.create-button{
  border-radius: 6px;
  width: 100%;
}
.post-item {
  padding: 5px 0 2px;
  cursor: pointer;
}
.post-item:last-child{
  padding: 5px 0 0;
}
.post-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.post-info {
  font-size: 14px;
  display: flex;
  justify-content: space-between;
}
.post-username {
  margin-right: 15px;
  display: flex;
  align-items: center;
  gap: 2px;
}
:deep(.el-divider--horizontal){
  margin: 8px 0 5px;
}
:deep(.el-dialog) {
  min-width: 400px;
}

.custom-tabs-label {
  display: inline-flex;
  align-items: center;
}
.custom-tabs-label span {
  vertical-align: middle;
  margin-left: 2px;
}
.el-tabs :deep(.el-tabs__item){
  padding: 10px;
}
.wide-tabs :deep(.el-tabs__item) {
  padding: 16px;
}
.wide-tabs :deep(.custom-tabs-label) {
  gap: 4px;
}
</style>