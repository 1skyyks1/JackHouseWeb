<template>
  <div>
    <navMenu></navMenu>
    <el-row justify="center" :gutter="10" style="margin-top: 4px; margin-bottom: 10px">
      <el-col :xs="18" :sm="20" :md="12" :lg="14" :xl="14">
        <el-autocomplete v-model="searchKeyword"
                         :fetch-suggestions="querySearchAsync"
                         placeholder="Please input"
                         @select="handleSelect"
                         debounce="600"
                         :suffix-icon="Search"
                         class="search-input">
          <template #default="{ item }">
            <div v-if="item.isNoResult" class="search-result-item no-result">
              无结果
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
          <span>Create</span>
        </el-button>
      </el-col>
    </el-row>
    <el-row justify="center" :gutter="10">
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span style="display: flex; align-items: center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bell" viewBox="0 0 16 16">
                  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
                </svg>
                <span style="margin-left: 5px">{{ t('forum.postType.announcement') }}</span>
              </span>
            </div>
          </template>
          <div>
            <div v-for="(post, index) in notice" :key="index" class="post-item" @click="goToPost(post.post_id)">
              <div class="post-title">{{ locale === 'zh' ? post.title_zh : post.title_en }}</div>
              <div class="post-info">
                <span class="post-username">{{ t('forum.by') }} {{ post.user_name }}</span>
                <span class="post-time">{{ formatDate(post.created_time) }}</span>
              </div>
              <el-divider />
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span style="display: flex; align-items: center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar2-week" viewBox="0 0 16 16">
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/>
                  <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5zM11 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"/>
                </svg>
                <span style="margin-left: 5px">{{ t('forum.postType.event') }}</span>
              </span>
            </div>
          </template>
          <div>
            <div v-for="(post, index) in event" :key="index" class="post-item" @click="goToPost(post.post_id)">
              <div class="post-title">{{ locale === 'zh' ? post.title_zh : post.title_en }}</div>
              <div class="post-info">
                <span class="post-username">{{ t('forum.by') }} {{ post.user_name }}</span>
                <span class="post-time">{{ formatDate(post.created_time) }}</span>
              </div>
              <el-divider />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row justify="center" :gutter="10">
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span style="display: flex; align-items: center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-flag" viewBox="0 0 16 16">
                  <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12 12 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A20 20 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a20 20 0 0 0 1.349-.476l.019-.007.004-.002h.001M14 1.221c-.22.078-.48.167-.766.255-.81.252-1.872.523-2.734.523-.886 0-1.592-.286-2.203-.534l-.008-.003C7.662 1.21 7.139 1 6.5 1c-.669 0-1.606.229-2.415.478A21 21 0 0 0 3 1.845v6.433c.22-.078.48-.167.766-.255C4.576 7.77 5.638 7.5 6.5 7.5c.847 0 1.548.28 2.158.525l.028.01C9.32 8.29 9.86 8.5 10.5 8.5c.668 0 1.606-.229 2.415-.478A21 21 0 0 0 14 7.655V1.222z"/>
                </svg>
                <span style="margin-left: 5px">{{ t('forum.postType.mapRequest') }}</span>
              </span>
            </div>
          </template>
          <div>
            <div v-for="(post, index) in request" :key="index" class="post-item" @click="goToPost(post.post_id)">
              <div class="post-title">{{ locale === 'zh' ? post.title_zh : post.title_en }}</div>
              <div class="post-info">
                <span class="post-username">{{ t('forum.by') }} {{ post.user_name }}</span>
                <span class="post-time">{{ formatDate(post.created_time) }}</span>
              </div>
              <el-divider />
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span style="display: flex; align-items: center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-square-text" viewBox="0 0 16 16">
                  <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2.5a2 2 0 0 0-1.6.8L8 14.333 6.1 11.8a2 2 0 0 0-1.6-.8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5a1 1 0 0 1 .8.4l1.9 2.533a1 1 0 0 0 1.6 0l1.9-2.533a1 1 0 0 1 .8-.4H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                  <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"/>
                </svg>
                <span style="margin-left: 5px">{{ t('forum.postType.normal') }}</span>
              </span>
            </div>
          </template>
          <div>
            <div v-for="(post, index) in normal" :key="index" class="post-item" @click="goToPost(post.post_id)">
              <div class="post-title">{{ locale === 'zh' ? post.title_zh : post.title_en }}</div>
              <div class="post-info">
                <span class="post-username">{{ t('forum.by') }} {{ post.user_name }}</span>
                <span class="post-time">{{ formatDate(post.created_time) }}</span>
              </div>
              <el-divider />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog v-model="newPost" style="padding-top: 10px">
      <el-select v-model="postForm.type" :placeholder="t('forum.placeholder.selectPostType')" style="width: 50%">
        <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
      <el-tabs v-model="tabName" type="card" style="margin-top: 10px">
        <el-tab-pane label="中文" name="zh">
          <el-input
              v-model="postForm.title_zh"
              placeholder="请输入标题"
              style="margin-bottom: 10px"></el-input>
          <editor v-model:content="postForm.content_zh"></editor>
        </el-tab-pane>
        <el-tab-pane label="English" name="en">
          <el-input
              v-model="postForm.title_en"
              placeholder="Please input the title"
              style="margin-bottom: 10px"></el-input>
          <editor v-model:content="postForm.content_en" style="min-height: 300px"></editor>
        </el-tab-pane>
      </el-tabs>
      <div style="margin-top: 10px">
        <el-button type="primary" plain @click="submitForm">
          {{ t('forum.submit') }}
        </el-button>
        <el-button plain @click="cancelForm">{{ t('forum.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import navMenu from "@/components/navmenu.vue";
import { ref, computed, reactive, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { postSearch, postUpdate, postCreate, allType3Post } from "@/api/post";
import router from '@/router/index'
import { Edit, Search } from '@element-plus/icons-vue'
import { dayjs, ElMessage } from 'element-plus'
import editor from '../components/editor.vue'
import { useStore } from "vuex"

const store = useStore()

const { locale, t } = useI18n();
const searchKeyword = ref('');
const page = ref(1);
const pageSize = ref(5)
const userId = computed(() => store.state.userId);

const options = computed(() => [
  {
    value: 0,
    label: t('forum.postType.normal'),
  },
  {
    value: 1,
    label: t('forum.postType.mapRequest'),
  },
  {
    value: 2,
    label: t('forum.postType.event'),
  },
]);

const newPost = ref(false)
const tabName = ref('zh')
const postForm = reactive({
  type: null,
  status: null,
  translations: [],
  title_zh: '',
  content_zh: '',
  title_en: '',
  content_en: '',
});
const notice = ref([])
const normal = ref([])
const event = ref([])
const request = ref([])

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD');
}

const getAllType3Post = () => {
  allType3Post().then(response => {
    normal.value = response.data[0].posts;
    request.value = response.data[1].posts;
    event.value = response.data[2].posts;
    notice.value = response.data[3].posts;
    console.log(response.data[0])
  })
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
  newPost.value = true
}

const submitForm = () => {
  const form = {
    user_id : userId.value,
    type: postForm.type,
    status: postForm.status,
    translations: [
      {
        title: postForm.title_zh,
        content: postForm.content_zh,
        language: 'zh'
      },
      {
        title: postForm.title_en,
        content: postForm.content_en,
        language: 'en'
      }
    ]
  }
  postCreate(form).then(() => {
    ElMessage.success('success')
    newPost.value = false;
  })
}

const cancelForm = () => {
  postForm.type = null;
  postForm.status = null;
  postForm.title_zh = '';
  postForm.content_zh = '';
  postForm.title_en = '';
  postForm.content_en = '';
  newPost.value = false;
}

const goToPost = (postId) => {
  router.push(`/post/${postId}`)
}

onBeforeMount(() => {
  getAllType3Post();
})
</script>

<style scoped>
.el-card{
  margin-bottom: 10px;
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
  padding: 5px 0 10px;
  cursor: pointer;
}
.post-item:hover{
  transform: scale(1.02);
  transition: all 0.2s ease;
}
.post-item:last-child{
  padding: 5px 0 0;
}
.post-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}
.post-info {
  font-size: 14px;
  display: flex;
  justify-content: space-between;
}
.post-username {
  margin-right: 15px;
}
:deep(.el-divider--horizontal){
  margin: 15px 0 5px;
}
:deep(.el-dialog) {
  min-width: 400px;
}
</style>