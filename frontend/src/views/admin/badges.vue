<template>
  <el-card shadow="never" class="main-card">
    <template #header>
      <div class="card-header">
        <span class="title">牌子发放</span>
        <div>
          <el-button type="primary" plain @click="badgeAdd = true">
            <el-icon style="margin-right: 3px"><Plus /></el-icon>
            上传牌子
          </el-button>
        </div>
      </div>
    </template>
    <div>
      <el-scrollbar max-height="90%">
        <el-table :data="badges" class="badge-table" v-loading="loading">
          <el-table-column prop="id" label="ID" align="center" min-width="153px"></el-table-column>
          <el-table-column prop="name" label="牌子名" align="center" min-width="150px"></el-table-column>
          <el-table-column label="牌子" align="center" min-width="100px">
            <template v-slot:default="scope">
              <el-image :src="scope.row.signedUrl"></el-image>
            </template>
          </el-table-column>
          <el-table-column label="跳转链接" align="center" min-width="100px">
            <template v-slot:default="scope">
              <el-button type="info" :icon="Link" plain size="small" @click="goToPage(scope.row.redirect_url)"></el-button>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" min-width="200px">
            <template v-slot:default="scope">
              {{ formatDate(scope.row.created_time) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" min-width="300px">
            <template v-slot:default="scope">
              <el-button type="success" plain size="small" @click="openEditDialog(scope.row.id)">设置</el-button>
              <el-button type="danger" plain size="small" @click="deleteBadge(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="totalBadges"
            @current-change="handlePageChange"
        />
      </el-scrollbar>
    </div>
  </el-card>

  <el-dialog v-model="badgeAdd" style="padding-top: 10px" width="400px">
    <BadgeUpload></BadgeUpload>
  </el-dialog>

  <el-dialog
      v-model="badgeEditVisible"
      title="分配徽章拥有者"
      width="400px"
  >
    <div style="max-width: 400px">
      <el-form :model="editForm">
        <el-form-item label="选择用户">
          <el-select
              v-model="editForm.userIds"
              multiple
              filterable
              remote
              :reserve-keyword="false"
              :remote-method="searchUsers"
              default-first-option
              :loading="loadingUsers"
              placeholder="请选择用户"
              style="width: 100%"
          >
            <el-option
                v-for="user in users"
                :key="user.user_id"
                :label="user.user_name"
                :value="user.user_id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div style="text-align: right">
        <el-button @click="badgeEditVisible = false">取消</el-button>
        <el-button type="success" @click="submitEdit" :loading="loading">
          确定修改
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { Link, Plus } from "@element-plus/icons-vue";
import { badgeList, badgeAddUser, badgeDelete } from "@/api/badge"
import { userList } from "@/api/user.js"
import { onBeforeMount, ref, reactive } from "vue";
import router from "@/router/index.js";
import { dayjs, ElMessage } from "element-plus";
import BadgeUpload from "@/components/badgeUpload.vue";
import debounce from 'lodash/debounce'

const currentPage = ref(1)
const pageSize = ref(7)
const totalBadges = ref(0)
const loading = ref(true)
const badges = ref([])
const badgeAdd = ref(false)

const currentBadgeId = ref(null)
const editForm = reactive({
  userIds: []
})
const loadingUsers = ref(false)
const users = ref([])
const badgeEditVisible = ref(false)

const goToPage = (page) => {
  router.push(page)
}

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD');
}

const handlePageChange = (page) => {
  currentPage.value = page;
  getBadgeList();
};

const getBadgeList = () => {
  loading.value = true;
  badgeList(currentPage.value, pageSize.value).then(res => {
    badges.value = res.data;
    totalBadges.value = res.total;
    loading.value = false;
  })
}

const deleteBadge = (row) => {
  badgeDelete(row.id).then(response => {
    getBadgeList();
  })
}

const submitEdit = async () => {
  if (editForm.userIds.length === 0) {
    ElMessage.warning('请至少选择一个用户')
    return
  }

  loading.value = true
  try {
    await badgeAddUser(currentBadgeId.value, { userIds: editForm.userIds })
    ElMessage.success('分配成功')
    badgeEditVisible.value = false
  } catch (err) {
    console.error(err)
    ElMessage.error('分配失败')
  } finally {
    loading.value = false
  }
}

const searchUsers = debounce(async (query) => {
  if (!query) {
    users.value = []
    return
  }
  loadingUsers.value = true
  try {
    const res = await userList(1, 10, query)
    users.value = res.data
  } catch (err) {
    console.error(err)
  } finally {
    loadingUsers.value = false
  }
}, 300)

const openEditDialog = (badgeId) => {
  currentBadgeId.value = badgeId
  editForm.userIds = []
  users.value = []
  badgeEditVisible.value = true
}

onBeforeMount(() => {
  getBadgeList();
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
.title{
  display: flex;
  align-items: center;
}
.badge-table{
  margin-bottom: 10px;
}
</style>