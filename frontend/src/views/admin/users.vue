<template>
  <div>
    <el-card shadow="never" class="main-card">
      <template #header>
        <div class="card-header">
          <span class="title">用户管理</span>
          <div>
            <el-input
                v-model="searchQuery"
                placeholder="用户名搜索"
                style="width: 200px; margin-right: 10px"
                @input="handleSearchInput"
                :suffix-icon="Search"
            />
            <el-button type="primary" plain @click="userAdd = true">
              <el-icon style="margin-right: 3px"><Plus /></el-icon>
              新增用户
            </el-button>
          </div>
        </div>
      </template>
      <div>
        <el-scrollbar max-height="90%">
          <el-table :data="users" class="user-table" v-loading="userTableLoading">
            <el-table-column prop="user_id" label="ID" align="center" width="63px"></el-table-column>
            <el-table-column prop="avatar" label="头像" align="center" width="100px">
              <template v-slot:default="scope">
                <el-avatar shape="square" :src="scope.row.avatar" style="margin-top: 5px"/>
              </template>
            </el-table-column>
            <el-table-column prop="user_name" label="用户名" align="center" width="200px"></el-table-column>
            <el-table-column prop="role" label="身份" align="center" width="130px">
              <template v-slot:default="scope">
                <el-tag type="success" v-if="scope.row.role === 2">管理员</el-tag>
                <el-tag type="info" v-else-if="scope.row.role === 0">普通用户</el-tag>
                <el-tag type="primary" v-else>组织者</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="账号状态" align="center" width="100px">
              <template v-slot:default="scope">
                <el-tag type="danger" v-if="scope.row.status === 2">封禁</el-tag>
                <el-tag type="info" v-else-if="scope.row.status === 0">正常</el-tag>
                <el-tag type="warning" v-else>限制</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="role" label="Osu!" align="center" width="100px">
              <template v-slot:default="scope">
                <el-link :href="osuPage(scope.row.osu_uid)" target="_blank" v-if="scope.row.osu_uid">
                  {{ scope.row.osu_uid }}
                </el-link>
                <span v-else>未绑定</span>
              </template>
            </el-table-column>
            <el-table-column prop="created_time" label="注册时间" align="center" width="150px">
              <template v-slot:default="scope">
                {{ formatDate(scope.row.created_time) }}
              </template>
            </el-table-column>
            <el-table-column prop="updated_time" label="最近更新时间" align="center" width="150px">
              <template v-slot:default="scope">
                {{ formatDate(scope.row.updated_time) }}
              </template>
            </el-table-column>
            <el-table-column prop="created_time" label="操作" align="center" width="250px">
              <template v-slot:default="scope">
                <el-button type="primary" plain size="small" @click="enterUserPage(scope.row.user_id)">主页</el-button>
                <el-button type="success" plain size="small" @click="editUser(scope.row.user_id)">修改</el-button>
                <el-button type="danger" plain size="small" @click="deleteUser(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
              :current-page="currentPage"
              :page-size="pageSize"
              :total="totalUsers"
              @current-change="handlePageChange"
          />
        </el-scrollbar>
      </div>
    </el-card>

    <el-dialog v-model="userEdit" width="400px">
      <el-form :model="userEditForm" label-width="100px" ref="editForm" :rules="formRules">
        <el-form-item label="用户名" prop="user_name">
          <el-input v-model="userEditForm.user_name" style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item label="头像">
          <el-input v-model="userEditForm.avatar" style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="userEditForm.password" style="width: 200px" type="password" clearable></el-input>
        </el-form-item>
        <el-form-item label="身份">
          <el-select v-model="userEditForm.role" style="width: 200px">
            <el-option label="普通用户" :value="0" />
            <el-option label="组织者" :value="1" />
            <el-option label="管理员" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="userEditForm.status" style="width: 200px">
            <el-option label="正常" :value="0" />
            <el-option label="限制" :value="1" />
            <el-option label="封禁" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain @click="submitForm">
            确认修改
          </el-button>
          <el-button plain @click="cancelForm">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog v-model="userAdd" width="400px">
      <el-form :model="userAddForm" label-width="100px" ref="addForm" :rules="formRules">
        <el-form-item label="用户名" prop="user_name">
          <el-input v-model="userAddForm.user_name" style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item label="头像">
          <el-input v-model="userAddForm.avatar" style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="userAddForm.password" style="width: 200px" type="password" clearable></el-input>
        </el-form-item>
        <el-form-item label="身份">
          <el-select v-model="userAddForm.role" style="width: 200px">
            <el-option label="普通用户" :value="0" />
            <el-option label="组织者" :value="1" />
            <el-option label="管理员" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="userAddForm.status" style="width: 200px">
            <el-option label="正常" :value="0" />
            <el-option label="限制" :value="1" />
            <el-option label="封禁" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain @click="createNewUser">
            确认新增
          </el-button>
          <el-button plain @click="cancelAddForm">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>

<script setup>
import { userList, userById, userUpdate, userDelete, userCreate } from '@/api/user';
import { ref, onBeforeMount, reactive } from "vue";
import { dayjs, ElMessage, ElMessageBox } from "element-plus";
import { Plus, Search } from "@element-plus/icons-vue"
import router from "@/router";
import { debounce } from 'lodash';

const users = ref([])
const searchQuery = ref('');
const currentPage = ref(1)
const pageSize = ref(9)
const totalUsers = ref(0)

const userTableLoading = ref(false)
const userAdd = ref(false)
const addForm = ref(null);
const userAddForm = reactive({
  user_name: '',
  avatar: '',
  password: '',
  role: '',
  status: ''
})
const userEdit = ref(false)
const editForm = ref(null);
const userEditForm = reactive({
  user_id: '',
  user_name: '',
  avatar: '',
  password: '',
  role: '',
  status: ''
});

const formRules = reactive({
  user_name: [
    { required: true, message: '请输入用户名', trigger: 'change' },
    { min: 3, max: 15, message: '用户名长度3-15位', trigger: 'change' }
  ],
})

const osuPage = (osuUid) => {
  return 'https://osu.ppy.sh/users/' + osuUid
}

const getUserList = () => {
  userTableLoading.value = true;
  userList(currentPage.value, pageSize.value, searchQuery.value).then(response => {
    users.value = response.data;
    totalUsers.value = response.total;
    userTableLoading.value = false;
  }).catch(err => {
      ElMessage.error(err)
  })
}

const debouncedSearch = debounce(() => {
  currentPage.value = 1;
  getUserList();
}, 500);

const handleSearchInput = () => {
  debouncedSearch();
};

const handlePageChange = (page) => {
  currentPage.value = page;
  getUserList();
};

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD'); // 格式化为 'YYYY-MM-DD'
}

const createNewUser = () => {
  addForm.value.validate((valid) => {
    if (valid) {
      const formData = { ...userAddForm };
      userCreate(formData).then(() => {
        ElMessage.success('新增成功')
        userAdd.value = false;
        getUserList();
      })
    }
    else{
      ElMessage.error('验证不通过，新增失败')
    }
  })
}

const cancelAddForm = () => {
  userAddForm.user_name = '';
  userAddForm.avatar = '';
  userAddForm.password = '';
  userAddForm.role = '';
  userAddForm.status = '';
  userAdd.value = false;
}

const enterUserPage = (userId) => {
  router.push({ path: `/user/${userId}` })
}

const editUser = async (userId) => {
  const response = await userById(userId)
  Object.assign(userEditForm, response.data)
  userEdit.value = true;
}

const deleteUser = (row) => {
  ElMessageBox.confirm(
      `此操作无法恢复，确认删除名为 ${row.user_name} 的用户？`,
      '警告',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    userDelete(row.user_id).then(() => {
      ElMessage.success('删除成功')
      getUserList();
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
  editForm.value.validate((valid) => {
    if (valid) {
      const formData = { ...userEditForm };
      if (!formData.password) {
        delete formData.password;
      }
      userUpdate(formData.user_id, formData).then(() => {
        ElMessage.success('修改成功')
        userEdit.value = false;
        getUserList();
      })
    }
    else{
      ElMessage.error('验证不通过，修改失败')
    }
  })
}

const cancelForm = () => {
  userEditForm.user_id = null;
  userEditForm.user_name = '';
  userEditForm.avatar = '';
  userEditForm.password = '';
  userEditForm.role = '';
  userEditForm.status = '';
  userEdit.value = false;
}

onBeforeMount(() => {
  getUserList();
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
.user-table{
  margin-bottom: 10px;
}
.title{
  display: flex;
  align-items: center;
}
</style>