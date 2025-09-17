<template>
  <el-card shadow="never" class="main-card">
    <template #header>
      <span>帖子管理</span>
    </template>
    <div>
      <el-table :data="posts" class="post-table" v-loading="postTableLoading" :max-height="'calc(100vh - 220px)'">
        <el-table-column prop="post_id" label="ID" align="center" min-width="63px"></el-table-column>
        <el-table-column prop="user_name" label="发帖人" align="center" min-width="180px"></el-table-column>
        <el-table-column prop="type" label="类型" align="center" min-width="100px">
          <template v-slot:default="scope">
            <el-tag v-if="scope.row.type === 0" type="info">普通</el-tag>
            <el-tag v-else-if="scope.row.type === 1" type="primary">征稿</el-tag>
            <el-tag v-else-if="scope.row.type === 2" type="warning">活动</el-tag>
            <el-tag v-else type="danger">公告</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标题" align="center" min-width="410px">
          <template v-slot:default="scope">
            {{ scope.row.title_zh || scope.row.title_en }}
          </template>
        </el-table-column>
        <el-table-column prop="created_time" label="创建时间" align="center" min-width="120px">
          <template v-slot:default="scope">
            {{ formatDate(scope.row.created_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="updated_time" label="最近更新时间" align="center" min-width="120px">
          <template v-slot:default="scope">
            {{ formatDate(scope.row.updated_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_time" label="操作" align="center" min-width="210px">
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
    </div>
  </el-card>
</template>

<script setup>
import { onBeforeMount, reactive, ref } from "vue";
import { postById, postDelete, postList, postUpdate } from "@/api/post"
import { dayjs, ElMessage, ElMessageBox } from "element-plus";
import router from "@/router";

const posts = ref([])
const currentPage = ref(1)
const pageSize = ref(12)
const totalPosts = ref(0)

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

const editPost = (postId) => {
  router.push('/forum/editor/' + postId);
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