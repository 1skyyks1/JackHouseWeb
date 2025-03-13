<template>
  <div>
    <navMenu></navMenu>
    <el-row justify="center">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-card v-loading="postLoading">
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
          <div v-if="postType === 1">
            <el-button type="danger" plain :icon="Upload" @click="uploadFile">
              {{ t('post.upload') }}
            </el-button>
          </div>
          <div>
            <div v-html="t('post.content')"></div>
          </div>
        </el-card>
        <el-card style="margin-top: 10px;" v-loading="commentLoading">
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
                  <div class="comment-user">
                    <el-avatar shape="square" :src="comment.avatar"></el-avatar>
                    <span>{{ comment.user_name }}</span>
                    <el-divider direction="vertical" style="height: 100%"/>
                  </div>
                  <div class="comment-content">{{ comment.comment }}</div>
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
    <el-dialog v-model="postEdit" style="padding-top: 10px">
      <el-tabs v-model="tabName" type="card">
        <el-tab-pane label="中文" name="zh">
          <el-input
              v-model="postEditForm.title_zh"
              placeholder="请输入标题"
              style="margin-bottom: 10px"></el-input>
          <editor v-model:content="postEditForm.content_zh"></editor>
        </el-tab-pane>
        <el-tab-pane label="English" name="en">
          <el-input
              v-model="postEditForm.title_en"
              placeholder="Please input the title"
              style="margin-bottom: 10px"></el-input>
          <editor v-model:content="postEditForm.content_en" style="min-height: 300px"></editor>
        </el-tab-pane>
      </el-tabs>
      <div style="margin-top: 10px">
        <el-button type="primary" plain @click="submitForm">
          {{ t('post.submit') }}
        </el-button>
        <el-button plain @click="cancelForm">{{ t('post.cancel') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog v-model="postFileUpload" style="padding-top: 20px; max-width: 400px">
      <mapUpload :postId="Number(postId)" :userId="userId"></mapUpload>
    </el-dialog>
  </div>
</template>

<script setup>
import navMenu from '../components/navmenu.vue'
import mapUpload from '../components/mapUpload.vue'
import { useRoute } from "vue-router";
import { postById, postUpdate, postDelete } from "@/api/post"
import { computed, onBeforeMount, reactive, ref } from "vue";
import { useStore } from "vuex"
import { useI18n } from 'vue-i18n';
import { userById } from "@/api/user";
import { commentByPostId, postCommentCreate, postCommentDelete } from "@/api/postComment";
import { dayjs, ElMessage, ElMessageBox } from "element-plus";
const { locale, mergeLocaleMessage, t } = useI18n();
import { EditPen, Ticket, Delete, Upload } from '@element-plus/icons-vue'
import editor from '../components/editor.vue'
import router from "@/router";

const route = useRoute()
const store = useStore()

const haveZh = ref(false)
const haveEn = ref(false)

const postLoading = ref(true)
const commentLoading = ref(true)

const postEdit = ref(false)
const tabName = ref('zh')
const postEditForm = reactive({
  post_id: null,
  user_id: null,
  type: null,
  status: null,
  translations: [],
  user: {}
});

const postFileUpload = ref(false)

const postId = route.params.post_id
const postUserId = ref(null)
const userId = computed(() => store.state.userId);
const userName = ref('')
const avatar = ref('');
const role = ref(0)
const time = ref(null)
const postType = ref(0)

const newComment = ref('')
const comments = ref([])
const pageSize = ref(10)
const currentPage = ref(1)
const totalComments = ref(0)

const getPostInfo = () => {
  postById(postId).then(response => {
    response.data.translations.forEach(translation => {
      mergeLocaleMessage(translation.language, {
        post: {
          title: translation.title,
          content: translation.content
        }
      });
    });
    postUserId.value = response.data.user_id
    time.value = response.data.created_time
    userName.value = response.data.user.user_name;
    avatar.value = response.data.user.avatar;
    role.value = response.data.user.role;
    postType.value = response.data.type;
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

const editPost = async () => {
  if(String(userId.value) !== String(postUserId.value)){
    ElMessage.warning(t('post.isNotMyPost'))
    return
  }
  await postById(postId).then(response => {
    let dataForm = response.data
    const zhTranslation = dataForm.translations.find(t => t.language === 'zh');
    const enTranslation = dataForm.translations.find(t => t.language === 'en');
    dataForm.title_zh = zhTranslation ? zhTranslation.title : '';
    dataForm.content_zh = zhTranslation ? zhTranslation.content : '';
    dataForm.title_en = enTranslation ? enTranslation.title : '';
    dataForm.content_en = enTranslation ? enTranslation.content : '';
    Object.assign(postEditForm, dataForm)
  })
  postEdit.value = true
}

const submitForm = () => {
  postEditForm.translations = [
    {
      title: postEditForm.title_zh,
      content: postEditForm.content_zh,
      language: 'zh'
    },
    {
      title: postEditForm.title_en,
      content: postEditForm.content_en,
      language: 'en'
    }
  ];
  postUpdate(postEditForm.post_id, postEditForm).then(() => {
    ElMessage.success(t('post.editSuccess'))
    postEdit.value = false;
    getPostInfo();
  })
}

const cancelForm = () => {
  postEditForm.post_id = null;
  postEditForm.user_id = null;
  postEditForm.type = null;
  postEditForm.translations = [];
  postEditForm.user = {};
  postEditForm.status = null;
  postEdit.value = false;
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

const uploadFile = () => {
  postFileUpload.value = true;
}

onBeforeMount(() => {
  getPostInfo()
  getCommentsByPostId()
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
  padding: 5px;
  display: flex;
  position: relative;
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
  padding: 0 6px;
  margin-top: 1px;
}
:deep(.el-dialog) {
  min-width: 400px;
}
</style>