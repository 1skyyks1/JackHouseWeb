<template>
  <div class="admin-tournament">
    <el-page-header @back="router.push('/admin/dashboard')" title="返回">
      <template #content>
        <span class="page-title">赛事管理</span>
      </template>
      <template #extra>
        <el-button type="primary" @click="openCreateModal()">
          <el-icon><Plus /></el-icon> 创建赛事
        </el-button>
      </template>
    </el-page-header>

    <!-- 赛事列表 -->
    <el-table :data="tournaments" v-loading="loading" stripe style="margin-top: 20px;">
      <el-table-column label="缩写" width="100">
        <template #default="{ row }">
          <el-tag type="primary">{{ row.acronym }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="赛事名称" min-width="200" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="报名时间" width="200">
        <template #default="{ row }">
          {{ formatDate(row.reg_start) }} - {{ formatDate(row.reg_end) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template #default="{ row }">
          <el-button type="primary" link @click="router.push(`/admin/tournament/${row.id}`)">
            管理
          </el-button>
          <el-popconfirm title="确定删除该赛事？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button type="danger" link>删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建赛事弹窗 -->
    <el-dialog v-model="showCreateModal" title="创建赛事" width="600px">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="16">
            <el-form-item label="赛事名称" required>
              <el-input v-model="form.name" placeholder="输入赛事名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="缩写" required>
              <el-input v-model="form.acronym" placeholder="如 OWC" maxlength="16" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="简介">
          <el-input v-model="form.desc" type="textarea" :rows="3" placeholder="赛事简介" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="队伍规模">
              <el-input-number v-model="form.team_size_min" :min="1" :max="8" /> - 
              <el-input-number v-model="form.team_size_max" :min="1" :max="8" /> 人
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="晋级名额">
              <el-input-number v-model="form.qual_top_n" :min="2" :max="128" /> 名
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="报名开始" required>
              <el-date-picker v-model="form.reg_start" type="datetime" placeholder="选择时间" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报名结束" required>
              <el-date-picker v-model="form.reg_end" type="datetime" placeholder="选择时间" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="排名模式">
          <el-radio-group v-model="form.qual_rank_mode">
            <el-radio :value="0">排名累加</el-radio>
            <el-radio :value="1">加权分数</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateModal = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTournaments, createTournament, deleteTournament } from '@/api/tournament'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 响应式状态
const tournaments = ref([])
const loading = ref(true)
const showCreateModal = ref(false)
const creating = ref(false)

const form = reactive({
  name: '',
  acronym: '',
  desc: '',
  team_size_min: 1,
  team_size_max: 2,
  qual_top_n: 32,
  qual_rank_mode: 0,
  reg_start: '',
  reg_end: ''
})

const openCreateModal = () => {
  console.log(111)
  showCreateModal.value = true
}

// 获取赛事列表
const fetchTournaments = async () => {
  try {
    loading.value = true
    const res = await getTournaments()
    tournaments.value = res
  } catch (error) {
    ElMessage.error('获取赛事列表失败')
  } finally {
    loading.value = false
  }
}

// 创建赛事
const handleCreate = async () => {
  creating.value = true
  try {
    await createTournament(form)
    ElMessage.success('创建成功')
    showCreateModal.value = false
    resetForm()
    await fetchTournaments()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '创建失败')
  } finally {
    creating.value = false
  }
}

// 删除赛事
const handleDelete = async (id) => {
  try {
    await deleteTournament(id)
    ElMessage.success('删除成功')
    await fetchTournaments()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '删除失败')
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    name: '', acronym: '', desc: '',
    team_size_min: 1, team_size_max: 2,
    qual_top_n: 32, qual_rank_mode: 0,
    reg_start: '', reg_end: ''
  })
}

// 工具函数
const getStatusText = (status) => {
  const map = { 0: '未开始', 1: '报名中', 2: '资格赛', 3: '正赛中', 4: '已结束' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = { 0: 'info', 1: 'success', 2: 'warning', 3: 'danger', 4: '' }
  return map[status] || 'info'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

onMounted(() => {
  fetchTournaments()
})
</script>

<style scoped>
.admin-tournament {
  padding: 20px;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
}
</style>
