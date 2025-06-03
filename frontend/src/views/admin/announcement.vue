<template>
  <el-card shadow="never" class="main-card">
    <template #header>
      <div class="card-header">
        <span>公告发布</span>
        <div>
          <el-button type="primary" plain size="small" @click="announcementAdd = true">
            <el-icon style="margin-right: 3px"><Plus /></el-icon>
            创建公告
          </el-button>
        </div>
      </div>
    </template>
    <div>
      <el-scrollbar max-height="90%">
        <el-table :data="announcements" class="announcement-table" v-loading="tableLoading">
          <el-table-column prop="post_id" label="ID" align="center" width="100px"></el-table-column>
          <el-table-column prop="user_name" label="发帖人" align="center" width="200px"></el-table-column>
          <el-table-column label="标题" align="center" width="340px">
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
          <el-table-column prop="created_time" label="操作" align="center" width="300px">
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
            :total="totalAnnouncements"
            @current-change="handlePageChange"
        />
      </el-scrollbar>
    </div>
  </el-card>

  <el-dialog v-model="announcementAdd" style="padding-top: 10px">
    <el-tabs v-model="tabName" type="card">
      <el-tab-pane label="中文" name="zh">
        <el-input
            v-model="announcementForm.title_zh"
            placeholder="请输入标题"
            style="margin-bottom: 10px"></el-input>
        <wangEditor v-model="announcementForm.content_zh"></wangEditor>
      </el-tab-pane>
      <el-tab-pane label="English" name="en">
        <el-input
            v-model="announcementForm.title_en"
            placeholder="Please input the title"
            style="margin-bottom: 10px"></el-input>
        <wangEditor v-model="announcementForm.content_en"></wangEditor>
      </el-tab-pane>
    </el-tabs>
    <div style="margin-top: 10px">
      <el-button type="primary" plain @click="createForm">
        创建
      </el-button>
      <el-button plain @click="cancelForm">取消</el-button>
    </div>
  </el-dialog>

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
import { Plus } from "@element-plus/icons-vue";
import { ref, onBeforeMount, reactive, computed } from "vue";
import { dayjs, ElMessage, ElMessageBox } from "element-plus";
import { postById, postByType, postCreate, postDelete, postUpdate } from '@/api/post'
import router from "@/router";
import wangEditor from "@/components/wangEditor.vue"
import { useStore } from "vuex"

const announcementAdd = ref(false)
const currentPage = ref(1)
const pageSize = ref(8)

const store = useStore()
const userId = computed(() => store.state.userId);

const announcements = ref([])
const totalAnnouncements = ref(0)
const tableLoading = ref(false)

const postEdit = ref(false)
const tabName = ref('zh')
const postEditForm = reactive({
  post_id: null,
  user_id: null,
  type: 3,
  status: null,
  translations: [],
  user: {}
});

const announcementForm = reactive({
  type: 3,
  translations: [],
  title_zh: '',
  content_zh: '',
  title_en: '',
  content_en: '',
});

const getAnnouncementList = () => {
  tableLoading.value = true;
  postByType(3, currentPage.value, pageSize.value).then(response => {
    announcements.value = response.data;
    totalAnnouncements.value = response.total;
    tableLoading.value = false;
  }).catch(err => {
    ElMessage.error(err)
  })
}

const handlePageChange = (page) => {
  currentPage.value = page;
  getAnnouncementList();
};

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
      `此操作无法恢复，确认删除此公告？`,
      '警告',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    postDelete(row.post_id).then(() => {
      ElMessage.success('删除成功')
      getAnnouncementList();
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
    getAnnouncementList();
  })
}

const createForm = () => {
  const form = {
    user_id : userId.value,
    type: 3,
    translations: [
      {
        title: announcementForm.title_zh,
        content: announcementForm.content_zh,
        language: 'zh'
      },
      {
        title: announcementForm.title_en,
        content: announcementForm.content_en,
        language: 'en'
      }
    ]
  }
  postCreate(form).then(() => {
    ElMessage.success('success')
    announcementAdd.value = false;
    getAnnouncementList();
  })
}

const cancelForm = () => {
  postEditForm.post_id = null;
  postEditForm.user_id = null;
  postEditForm.type = 3;
  postEditForm.translations = [];
  postEditForm.user = {};
  postEditForm.status = null;
  postEdit.value = false;
}

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD');
}

onBeforeMount(() => {
  getAnnouncementList()
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
.announcement-table{
  margin-bottom: 10px;
}
</style>