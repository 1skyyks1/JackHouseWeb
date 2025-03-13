<template>
  <el-card shadow="never" class="main-card">
    <template #header>
      <div class="card-header">
        <span>投稿审核</span>
        <div>
          <el-select v-model="selectPostId" style="width: 240px;" size="small" @change="selectRequest">
            <el-option v-for="post in requestList"
                       :key="post.post_id"
                       :value="post.post_id"
                       :label="locale.value === 'zh' ? post.title_zh : post.title_en">
            </el-option>
          </el-select>
        </div>
      </div>
    </template>
    <div>
      <el-scrollbar max-height="90%">
        <el-table :data="fileList" class="file-table" v-loading="fileTableLoading">
          <el-table-column prop="file_name" label="文件名" align="center" width="550px"></el-table-column>
          <el-table-column prop="user_name" label="投稿人" align="center" width="200px"></el-table-column>
          <el-table-column prop="status" label="状态" align="center" width="100px">
            <template v-slot:default="scope">
              <el-tag v-if="scope.row.status === 0" type="warning">未审核</el-tag>
              <el-tag v-else-if="scope.row.status === 1" type="success">通过</el-tag>
              <el-tag v-else type="danger">不通过</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="uploaded_time" label="上传时间" align="center" width="150px">
            <template v-slot:default="scope">
              {{ formatDate(scope.row.created_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="created_time" label="操作" align="center" width="240px">
            <template v-slot:default="scope">
              <el-button type="primary" plain size="small" @click="downloadFile(scope.row.file_id)">下载</el-button>
              <el-button type="success" plain size="small" @click="approve(scope.row.file_id)" :disabled="scope.row.status === 1">通过</el-button>
              <el-button type="danger" plain size="small" @click="reject(scope.row.file_id)" :disabled="scope.row.status === 2">不通过</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="totalFiles"
            @current-change="handlePageChange"
        />
      </el-scrollbar>
    </div>
  </el-card>
</template>

<script setup>
import { computed, onBeforeMount, reactive, ref } from "vue";
import { dayjs, ElMessage, ElMessageBox } from "element-plus";
import router from "@/router";
import { postFileList, postFileByPostId, postFileReview, postFileUrl } from "@/api/postFile"
import { requestByUserId } from "@/api/post"
import { useStore } from "vuex"
import { useI18n } from 'vue-i18n';

const store = useStore()
const { locale } = useI18n();

const fileList = ref([])
const currentPage = ref(1)
const pageSize = ref(15)
const totalFiles = ref(0)

const userId = computed(() => store.state.userId);
const requestList = ref([])
const selectPostId = ref()
const fileTableLoading = ref(false)

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD');
}

const getRequestList = () => {
  requestByUserId(userId.value).then(response => {
    requestList.value = response.data
    console.log(requestList.value)
  })
}

const selectRequest = () => {
  if(selectPostId.value){
    getPostFileByPostId();
  }
}

const getPostFileByPostId = () => {
  fileTableLoading.value = true;
  postFileByPostId(selectPostId.value, currentPage.value, pageSize.value).then(response => {
    fileList.value = response.data;
    totalFiles.value = response.total;
    fileTableLoading.value = false;
  })
}

const handlePageChange = (page) => {
  currentPage.value = page;
  getPostFileByPostId();
};

const approve = async (fileId) => {
  const newStatus = {
    status: 1
  }
  await postFileReview(fileId, newStatus).then(() => {
    ElMessage.success('审核成功')
  })
  getPostFileByPostId();
}

const reject = async (fileId) => {
  const newStatus = {
    status: 2
  }
  await postFileReview(fileId, newStatus).then(() => {
    ElMessage.success('审核成功')
  })
  getPostFileByPostId();
}

const downloadFile = (fileId) => {
  postFileUrl(fileId).then(response => {
    const url = response.data.fileUrl;
    window.open(url);
  })
}

onBeforeMount(() => {
  getRequestList()
})
</script>

<style scoped>
.main-card{
  height: calc(100vh - 80px);
}
.card-header{
  display: flex;
  justify-content: space-between;
}
.file-table{
  margin-bottom: 10px;
}
</style>