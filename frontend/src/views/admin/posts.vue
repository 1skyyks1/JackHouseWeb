<template>
  <el-card shadow="never" class="main-card">
    <template #header>
      <span>帖子管理</span>
    </template>
    <div>
      <el-scrollbar max-height="90%">
        <el-table :data="posts" class="post-table" v-loading="postTableLoading">
          <el-table-column prop="post_id" label="ID" align="center" width="100px"></el-table-column>
          <el-table-column prop="user_name" label="发帖人" align="center" width="200px"></el-table-column>
          <el-table-column prop="type" label="类型" align="center" width="100px">
            <template v-slot:default="scope">
              <el-tag v-if="scope.row.type === 0" type="info">普通</el-tag>
              <el-tag v-else-if="scope.row.type === 1" type="primary">征稿</el-tag>
              <el-tag v-else-if="scope.row.type === 2" type="warning">活动</el-tag>
              <el-tag v-else type="danger">公告</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="标题" align="center" width="330px">
            <template v-slot:default="scope">
              {{ scope.row.title_zh || scope.row.title_en }}
            </template>
          </el-table-column>
          <el-table-column prop="created_time" label="创建时间" align="center" width="150px">
            <template v-slot:default="scope">
              {{ formatDate(scope.row.created_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="updated_time" label="最近更新时间" align="center" width="150px">
            <template v-slot:default="scope">
              {{ formatDate(scope.row.updated_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="created_time" label="操作" align="center" width="210px">
            <template v-slot:default="scope">
              <el-button type="primary" plain size="small" @click="enterPostPage(scope.row.post_id)">查看</el-button>
              <el-button type="success" plain size="small" @click="editPost(scope.row.post_id)">修改</el-button>
              <el-button type="danger" plain size="small" @click="deletePost(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="totalPosts"
            @current-change="handlePageChange"
        />
      </el-scrollbar>
    </div>
  </el-card>

  <el-dialog v-model="postEdit" style="padding-top: 10px">
    <el-tabs v-model="tabName" type="card">
      <el-tab-pane label="中文" name="zh">
        <el-input
          v-model="postEditForm.title_zh"
          placeholder="请输入标题"
          style="margin-bottom: 10px"></el-input>
        <wangEditor v-model="postEditForm.content_zh"></wangEditor>
      </el-tab-pane>
      <el-tab-pane label="English" name="en">
        <el-input
            v-model="postEditForm.title_en"
            placeholder="Please input the title"
            style="margin-bottom: 10px"></el-input>
        <wangEditor v-model="postEditForm.content_en"></wangEditor>
      </el-tab-pane>
    </el-tabs>
    <div style="margin-top: 10px">
      <el-button type="primary" plain @click="submitForm">
        确认修改
      </el-button>
      <el-button plain @click="cancelForm">取消</el-button>
    </div>
  </el-dialog>

</template>

<script setup>
import { onBeforeMount, reactive, ref } from "vue";
import { postById, postDelete, postList, postUpdate } from "@/api/post"
import { dayjs, ElMessage, ElMessageBox } from "element-plus";
import router from "@/router";
import wangEditor from "@/components/wangEditor.vue"

const posts = ref([])
const currentPage = ref(1)
const pageSize = ref(15)
const totalPosts = ref(0)

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

const postTableLoading = ref(false)

const getPostList = () => {
  postTableLoading.value = true;
  postList(currentPage.value, pageSize.value).then(response => {
    posts.value = response.data;
    totalPosts.value = response.total;
    postTableLoading.value = false;
  }).catch(err => {
    ElMessage.error(err)
  })
}

const handlePageChange = (page) => {
  currentPage.value = page;
  getPostList();
};

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD');
}

const enterPostPage = (postId) => {
  router.push({ path: `/post/${postId}` })
}

const editPost = async (postId) => {
  await postById(postId).then(response => {
    let dataForm = response.data
    const zhTranslation = dataForm.translations.find(t => t.language === 'zh');
    const enTranslation = dataForm.translations.find(t => t.language === 'en');
    dataForm.title_zh = zhTranslation ? zhTranslation.title : '';
    dataForm.content_zh = zhTranslation ? zhTranslation.content : '';
    dataForm.title_en = enTranslation ? enTranslation.title : '';
    dataForm.content_en = enTranslation ? enTranslation.content : '';
    Object.assign(postEditForm, dataForm)
    postEdit.value = true
  })
}

const deletePost = (row) => {
  ElMessageBox.confirm(
      `此操作无法恢复，确认删除此帖子？`,
      '警告',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    postDelete(row.post_id).then(() => {
      ElMessage.success('删除成功')
      getPostList();
    }).catch(err => {
      ElMessage.error(err)
    })
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '取消删除操作',
    })
  })
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
    ElMessage.success('修改成功')
    postEdit.value = false;
    getPostList();
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

onBeforeMount(() => {
  getPostList()
})
</script>

<style scoped>
.main-card{
  height: calc(100vh - 80px);
}
.post-table{
  margin-bottom: 10px;
}
</style>