<template>
  <el-card shadow="never" class="main-card">
    <template #header>
      <div class="card-header">
        <span class="title">投稿审核</span>
        <div>
          <el-checkbox v-model="selectAll" label="All Files" size="large" @change="selectAllChange" style="margin-right: 20px" :disabled="selectAll" />
          <el-select v-model="selectPostId" style="width: 240px;" @change="selectRequest">
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
      <el-table :data="fileList" class="file-table" v-loading="fileTableLoading" :max-height="'calc(100vh - 230px)'">
        <el-table-column prop="file_name" label="文件名" align="center" min-width="533px"></el-table-column>
        <el-table-column prop="user_name" label="投稿人" align="center" min-width="200px"></el-table-column>
        <el-table-column prop="status" label="状态" align="center" min-width="100px">
          <template v-slot:default="scope">
            <el-tag v-if="scope.row.status === 0" type="warning">未审核</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success">通过</el-tag>
            <el-tag v-else type="danger">不通过</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="上传时间" align="center" min-width="120px">
          <template v-slot:default="scope">
            {{ formatDate(scope.row.uploaded_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_time" label="操作" align="center" min-width="250px">
          <template v-slot:default="scope">
            <el-button type="primary" plain size="small" @click="downloadFile(scope.row.file_id)">下载</el-button>
            <el-button type="warning" plain size="small" @click="reviewFile(scope.row.file_id)" :disabled="scope.row.status !== 0">审核</el-button>
            <el-button type="danger" plain size="small" @click="deleteFile(scope.row.file_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="totalFiles"
          @current-change="handlePageChange"
      />
    </div>
  </el-card>

  <el-dialog v-model="fileReview" style="padding-top: 10px" width="400px">
    <el-form :model="reviewForm">
      <el-form-item>
        <el-radio-group v-model="reviewForm.result">
          <el-radio value="1">通过</el-radio>
          <el-radio value="2">不通过</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="反馈">
        <el-input type="textarea" v-model="reviewForm.feedback" :rows="2"></el-input>
      </el-form-item>
    </el-form>
    <div>
      <el-button type="success" @click="submitReview">
        <span>确定审核</span>
      </el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed, onBeforeMount, reactive, ref } from "vue";
import { dayjs, ElMessage, ElMessageBox } from "element-plus";
import router from "@/router";
import { postFileList, postFileByPostId, postFileReview, postFileUrl, postFileDelete } from "@/api/postFile"
import { requestByUserId } from "@/api/post"
import { useStore } from "vuex"
import { useI18n } from 'vue-i18n';

const store = useStore()
const { locale } = useI18n();

const fileList = ref([])
const currentPage = ref(1)
const pageSize = ref(13)
const totalFiles = ref(0)
const selectAll = ref(true)

const userId = computed(() => store.state.userId);
const requestList = ref([])
const selectPostId = ref(null)
const fileTableLoading = ref(false)

const fileReview = ref(false)
const reviewForm = reactive({
  file_id: null,
  result: null,
  feedback: ''
})

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD');
}

const getRequestList = () => {
  requestByUserId(userId.value).then(response => {
    requestList.value = response.data
    // console.log(requestList.value)
  })
}

const selectRequest = () => {
  if(selectPostId.value){
    selectAll.value = false;
    currentPage.value = 1
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
  if(selectAll.value){
    getAllFiles();
  }
  else{
    getPostFileByPostId();
  }
};

const downloadFile = (fileId) => {
  postFileUrl(fileId).then(response => {
    const url = response.data.fileUrl;
    window.open(url);
  })
}

const resetForm = () => {
  reviewForm.file_id = null;
  reviewForm.result = null;
  reviewForm.feedback = '';
}

const reviewFile = (fileId) => {
  fileReview.value = true;
  reviewForm.file_id = fileId;
}

const submitReview = () => {
  const updateData = {
    status: reviewForm.result,
    feedback: reviewForm.feedback,
  };
  postFileReview(reviewForm.file_id, updateData).then(response => {
    fileReview.value = false;
    resetForm();
    getPostFileByPostId();
  })
}

const deleteFile = (fileId) => {
  ElMessageBox.confirm(
      '请注意删除不可还原，确认删除？',
      'Warning',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    postFileDelete(fileId).then(response => {
      if(selectAll.value){
        getAllFiles();
      }
      else{
        getPostFileByPostId();
      }
    })
  })
}

const getAllFiles = () => {
  fileTableLoading.value = true;
  postFileList(currentPage.value, pageSize.value).then(response => {
    fileList.value = response.data;
    totalFiles.value = response.total;
    fileTableLoading.value = false;
  })
}

const selectAllChange = () => {
  if(selectAll.value){
    selectPostId.value = null;
    currentPage.value = 1;
    getAllFiles();
  }
}

onBeforeMount(() => {
  getRequestList()
  getAllFiles();
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
.title{
  display: flex;
  align-items: center;
}
</style>