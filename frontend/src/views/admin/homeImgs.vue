<template>
  <el-card shadow="never" class="main-card">
    <template #header>
      <div class="card-header">
        <span class="title">头图设置</span>
        <div>
          <el-button type="primary" plain @click="homeImgAdd = true">
            <el-icon style="margin-right: 3px"><Plus /></el-icon>
            新增头图
          </el-button>
        </div>
      </div>
    </template>
    <div>
      <el-scrollbar max-height="90%">
        <el-table :data="homeImgs" class="homeImg-table" v-loading="tableLoading">
          <el-table-column prop="img_id" label="ID" align="center" width="153px"></el-table-column>
          <el-table-column prop="sort_order" label="头图顺序" align="center" width="150px"></el-table-column>
          <el-table-column prop="description" label="描述" align="center" width="300px"></el-table-column>
          <el-table-column label="跳转链接" align="center" width="100px">
            <template v-slot:default="scope">
              <el-button type="info" :icon="Link" plain size="small" @click="goToPage(scope.row.redirect_url)"></el-button>
            </template>
          </el-table-column>
          <el-table-column prop="created_time" label="创建时间" align="center" width="200px">
            <template v-slot:default="scope">
              {{ formatDate(scope.row.created_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="created_time" label="操作" align="center" width="340px">
            <template v-slot:default="scope">
              <el-button type="success" plain size="small" @click="editHomeImg(scope.row)">修改</el-button>
              <el-button type="danger" plain size="small" @click="deleteHomeImg(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="totalImgs"
            @current-change="handlePageChange"
        />
      </el-scrollbar>
    </div>
  </el-card>

  <el-dialog v-model="homeImgAdd" style="padding-top: 10px" width="400px">
    <HomeImgUpload :userId="userId"></HomeImgUpload>
  </el-dialog>

  <el-dialog v-model="homeImgEdit" style="padding-top: 10px" width="400px">
    <div style="max-width: 400px">
      <el-form :model="editForm">
        <el-form-item label="排序">
          <el-input-number v-model="editForm.sort_order" max="3" min="0" step="1" size="small"></el-input-number>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" size="small"></el-input>
        </el-form-item>
        <el-form-item label="跳转路径">
          <el-input v-model="editForm.redirect_url" size="small"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <el-button type="success" @click="submitEdit">
        <span>确定修改</span>
      </el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { Plus, Link, Upload } from "@element-plus/icons-vue";
import { ref, onBeforeMount, reactive, computed } from "vue";
import { dayjs, ElMessage, ElMessageBox } from "element-plus";
import { homeImg, homeImgCreate, homeImgUpdate, homeImgDelete, homeImgList } from '@/api/homeImg'
import HomeImgUpload from "@/components/homeImgUpload.vue";
import { useStore } from "vuex"
import router from "@/router";

const homeImgAdd = ref(false)
const homeImgEdit = ref(false)
const editForm = reactive({
  img_id: null,
  sort_order: 0,
  description: '',
  redirect_url: ''
})

const currentPage = ref(1)
const pageSize = ref(8)

const store = useStore()
const userId = computed(() => store.state.userId);

const homeImgs = ref([])
const totalImgs = ref(0)
const tableLoading = ref(false)

const goToPage = (page) => {
  router.push(page)
}

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD');
}

const getHomeImgList = () => {
  tableLoading.value = true;
  homeImgList(currentPage.value, pageSize.value).then(response => {
    homeImgs.value = response.data;
    totalImgs.value = response.total;
    tableLoading.value = false;
  }).catch()
}

const editHomeImg = (row) => {
  editForm.img_id = row.img_id;
  editForm.sort_order = row.sort_order;
  editForm.redirect_url = row.redirect_url;
  editForm.description = row.description;
  homeImgEdit.value = true;
}

const resetForm = () => {
  editForm.img_id = null;
  editForm.sort_order = 0;
  editForm.redirect_url = '';
  editForm.description = '';
}

const submitEdit = () => {
  const updateData = {
    sort_order: editForm.sort_order,
    description: editForm.description,
    redirect_url: editForm.redirect_url
  };
  homeImgUpdate(editForm.img_id, updateData).then(response => {
    homeImgEdit.value = false;
    resetForm();
    getHomeImgList();
  })
}

const deleteHomeImg = (row) => {
  homeImgDelete(row.img_id).then(response => {
    getHomeImgList();
  })
}

const handlePageChange = (page) => {
  currentPage.value = page;
  getHomeImgList()
};

onBeforeMount(() => {
  getHomeImgList()
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
.homeImg-table{
  margin-bottom: 10px;
}
.title{
  display: flex;
  align-items: center;
}
</style>