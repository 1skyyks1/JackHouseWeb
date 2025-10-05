<template>
  <div v-cloak>
    <navMenu></navMenu>
    <el-row justify="center">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-card v-loading="postLoading" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="post-header">
                <el-icon><Ticket /></el-icon>
                <span>{{ t('post.forumPost') }}</span>
              </div>
              <div>
                <el-button circle plain @click="editPost">
                  <el-icon><EditPen /></el-icon>
                </el-button>
                <el-button circle plain @click="deletePost">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
          <div class="header">
            <div class="title">{{ t('post.title') }}</div>
            <div class="info">
              <div class="time">
                <span>{{ formatDate(time) }}</span>
              </div>
              <div class="user">
                <span>{{ t('post.by') }}</span>
                <el-avatar shape="square" :src="avatar"></el-avatar>
                <span>{{ userName }}</span>
              </div>
            </div>
          </div>
          <el-divider></el-divider>
          <div>
            <div class="prose max-w-none dark:prose-invert" v-html="t('post.content')"></div>
          </div>
        </el-card>
        <el-card style="margin: 10px 0;" shadow="never" v-if="canUpload">
          <mapUpload :postId="Number(postId)" :userId="userId" :limit="limit" @upload-success="getUserPostFiles"/>
        </el-card>
        <el-card style="margin: 10px 0;" shadow="never" v-if="userPostFiles && userPostFiles.length > 0">
          <template #header>
            <div class="card-header">
              <div class="post-header">
                <el-icon><MessageBox /></el-icon>
                <span>{{ t('post.myPostFile') }}</span>
                <el-tooltip
                    :content="t('post.noteTooltip')"
                    placement="top"
                >
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <div>
                <el-tooltip
                    :content="t('post.more')"
                    placement="top"
                >
                  <el-button circle plain @click="goToUserPage(userId)">
                    <el-icon><More /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
          </template>
          <div>
            <div v-for="file in userPostFiles" class="post-file">
              <div>{{ file.file_name }}</div>
              <div class="file-note" v-if="!file.note">
                <el-input
                    v-model="file.tempNote"
                    :placeholder="t('post.addNote')"
                    :disabled="!!file.note"
                    type="textarea"
                />
                <el-button
                    type="primary"
                    plain
                    size="small"
                    :disabled="!!file.note || !file.tempNote"
                    @click="submitNote(file.file_id, file.tempNote)"
                >
                  {{ t('post.submitNote') }}
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
        <el-card style="margin: 10px 0;" v-loading="commentLoading" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="post-header">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ t('post.comments') }}</span>
              </div>
            </div>
          </template>
          <div class="comments">
            <div class="comment-form">
              <el-input
                  type="textarea"
                  :rows="3"
                  v-model="newComment"
                  :placeholder="t('post.placeholder')"
              ></el-input>
              <div style="display: flex; justify-content: right">
                <el-button type="success" plain size="small" style="margin-top: 10px;" @click="createComment">{{ t('post.createComment') }}</el-button>
              </div>
            </div>
            <el-divider class="comment-divider"></el-divider>
            <div class="comment-list">
              <div v-for="comment in comments" :key="comment.id">
                <div class="comment-item">
                  <div class="comment-user" v-if="!isMobile">
                    <el-avatar shape="square" :src="comment.avatar"></el-avatar>
                    <span class="user-name" @click="goToUserPage(comment.user_id)">{{ comment.user_name }}</span>
                    <el-divider direction="vertical" style="height: 100%"/>
                  </div>
                  <div class="comment-content">
                    <span v-if="isMobile">
                      <span class="user-name" @click="goToUserPage(comment.user_id)">{{ comment.user_name }}</span>
                      :
                    </span>
                    {{ comment.comment }}
                  </div>
                  <div class="bottom">
                    <el-button text class="delete" v-if="String(comment.user_id) === String(userId)" @click="deletePostComment(comment.comment_id)">{{ t('post.deleteComment') }}</el-button>
                    <div class="comment-time">{{ formatDate(comment.created_time) }}</div>
                  </div>
                </div>
                <el-divider class="comment-divider"></el-divider>
              </div>
            </div>
            <el-pagination
                style="margin-top: 20px; justify-content: center"
                background
                layout="prev, pager, next"
                :page-size="pageSize"
                :total="totalComments"
                @current-change="handlePageChange"
            ></el-pagination>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import navMenu from '../components/navmenu.vue'
import mapUpload from '../components/mapUpload.vue'
import { useRoute } from "vue-router";
import { postById, postDelete } from "@/api/post"
import { computed, onBeforeMount, reactive, ref } from "vue";
import { useStore } from "vuex"
import { useI18n } from 'vue-i18n';
import { commentByPostId, postCommentCreate, postCommentDelete } from "@/api/postComment";
import { postFileByPostAndUser, postFileUpdate } from "@/api/postFile.js";
import { dayjs, ElMessage, ElMessageBox } from "element-plus";
const { mergeLocaleMessage, t } = useI18n();
import { EditPen, Ticket, Delete, More, MessageBox, QuestionFilled, ChatDotRound } from '@element-plus/icons-vue'
import router from "@/router";
import { useBreakpoints } from '@vueuse/core';

const breakpoints = useBreakpoints({
  tablet: 768,
  laptop: 992,
  desktop: 1200,
});

const isMobile = breakpoints.smaller('tablet');

const route = useRoute()
const store = useStore()

const postLoading = ref(true)
const commentLoading = ref(true)

const postId = route.params.post_id
const postUserId = ref(null)
const userId = computed(() => store.state.userId);
const userName = ref('')
const avatar = ref('');
const role = ref(0)
const time = ref(null)
const postType = ref(0)
const end = ref(null)
const limit = ref(null)

const userPostFiles = ref([])

const newComment = ref('')
const comments = ref([])
const pageSize = ref(10)
const currentPage = ref(1)
const totalComments = ref(0)

const getPostInfo = () => {
  postById(postId).then(response => {
    const zhTranslation = response.data.translations.find(t => t.language === 'zh');
    const enTranslation = response.data.translations.find(t => t.language === 'en');

    const zhTitle = zhTranslation?.title || enTranslation?.title || t('post.noTitle');
    const zhContent = zhTranslation?.content || enTranslation?.content || t('post.noContent');
    const enTitle = enTranslation?.title || zhTranslation?.title || t('post.noTitle');
    const enContent = enTranslation?.content || zhTranslation?.content || t('post.noContent');

    mergeLocaleMessage('zh', {
      post: { title: zhTitle, content: zhContent }
    });
    mergeLocaleMessage('en', {
      post: { title: enTitle, content: enContent }
    });

    postUserId.value = response.data.user_id
    time.value = response.data.created_time
    userName.value = response.data.user.user_name;
    avatar.value = response.data.user.avatar;
    role.value = response.data.user.role;
    postType.value = response.data.type;
    end.value = response.data.end;
    limit.value = response.data.limit;
    postLoading.value = false;
  })
}

const getCommentsByPostId = () => {
  commentByPostId(currentPage.value, pageSize.value, postId).then(response => {
    comments.value = response.data;
    totalComments.value = response.total;
    commentLoading.value = false;
  })
}

const editPost = () => {
  router.push('/forum/editor/' + postId);
}

const createComment = () => {
  if (!userId.value) {
    ElMessage.warning(t('post.login'))
    store.commit('SET_LOGIN_DIALOG', true)
    return
  }
  let comment = {
    user_id: userId.value,
    post_id: postId,
    comment: newComment.value
  }
  postCommentCreate(comment).then(() => {
    ElMessage.success(t('post.postSuccess'))
    newComment.value = ''
    getCommentsByPostId()
  })
}

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD');
}

const handlePageChange = (page) => {
  currentPage.value = page;
  getCommentsByPostId();
}

const deletePostComment = (commentId) => {
  postCommentDelete(commentId).then(() => {
    ElMessage.success(t('post.deleteCommentSuccess'))
    getCommentsByPostId()
  })
}

const deletePost = () => {
  if(String(userId.value) !== String(postUserId.value)){
    ElMessage.warning(t('post.delete.isNotMyPost'))
    return
  }
  ElMessageBox.confirm(
      t('post.delete.text'),
      t('post.delete.warning'),
      {
        confirmButtonText: t('post.delete.confirm'),
        cancelButtonText: t('post.delete.cancel'),
        type: 'warning',
      }
  ).then(() => {
    postDelete(postId).then(() => {
      ElMessage.success(t('post.delete.success'))
      router.push('/forum')
    }).catch(err => {
    ElMessage.error(err)
    })
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: t('post.delete.cancelText'),
    })
  })
}

const goToUserPage = (userId) => {
  router.push('/user/' + userId)
}

const getUserPostFiles = () => {
  postFileByPostAndUser(postId).then(response => {
    userPostFiles.value = response.data.map(file => ({
      ...file,
      tempNote: ''
    }));
  })
}

const submitNote = (fileId, tempNote) => {
  postFileUpdate(fileId, { note: tempNote }).then(() => {
    ElMessage.success(t('post.addNoteSuccess'))
    getUserPostFiles();
  })
}

const canUpload = computed(() => {
  if(postType.value === 1) {
    const now = new Date();
    const endDate = new Date(end.value);
    return now < endDate;
  }
  else {
    return false
  }
})

onBeforeMount(() => {
  getPostInfo();
  getUserPostFiles();
  getCommentsByPostId();
})
</script>

<style scoped>
[v-cloak]{
  display: none !important;
}
:deep(.el-card .el-card__header){
  padding: 1vh 15px;
}
.card-header{
  display: flex;
  justify-content: space-between;
}
.post-header{
  display: flex;
  align-items: center;
  gap: 6px;
}
.header{
  margin: 4px 4px 0 4px;
}
.title{
  font-weight: bold;
  font-size: 24px;
}
.info{
  margin-top: 20px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.user{
  display: flex;
  align-items: center;
  gap: 8px;
}
.el-divider{
  margin-top: 8px;
}
.comment-form {
  margin-bottom: 20px;
}
.comment-divider{
  margin-bottom: 10px;
}
.comment-list {
  margin-top: 5px;
}
.comment-item {
  margin-bottom: 10px;
  display: flex;
  position: relative;
  padding: 5px 5px 20px;
}
.comment-user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
}
.comment-content {
  margin-left: 10px;
  font-size: 14px;
}
.comment-time {
  font-size: 12px;
  color: #999;
}
.el-pagination {
  margin-top: 20px;
  text-align: center;
}
.bottom{
  position: absolute;
  right: 10px;
  bottom: 0;
  display: flex;
  justify-content: right;
  align-items: center;
}
.delete{
  font-size: 11px;
  margin: 1px 6px 0;
  padding: 0 6px;
}
:deep(.el-dialog) {
  min-width: 400px;
}
.rich-text-content :deep(img) {
  max-width: 100%;
  height: auto;
}
.user-name {
  font-weight: bold;
  cursor: pointer;
  &:hover{
    text-decoration: underline;
  }
}
.post-file {
  margin-bottom: 10px;
}
.file-note {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.card-header {
  height: 32px;
}
</style>