<template>
  <div class="register-page">
    <!-- 未报名状态 -->
    <el-row :gutter="24" v-if="!myTeam">
      <!-- 创建队伍 -->
      <el-col :xs="24" :sm="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon size="20"><Plus /></el-icon>
              <span>创建队伍</span>
            </div>
          </template>
          <el-form label-position="top">
            <el-form-item label="队伍名称">
              <el-input v-model="teamName" placeholder="输入队伍名称" maxlength="32" show-word-limit />
            </el-form-item>
            <el-button type="primary" :loading="creating" :disabled="!teamName" @click="handleCreateTeam" style="width: 100%;">
              创建队伍
            </el-button>
          </el-form>
        </el-card>
      </el-col>

      <!-- 加入队伍 -->
      <el-col :xs="24" :sm="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon size="20"><Link /></el-icon>
              <span>加入队伍</span>
            </div>
          </template>
          <el-form label-position="top">
            <el-form-item label="邀请码">
              <el-input v-model="inviteCode" placeholder="输入6位邀请码" maxlength="8" />
            </el-form-item>
            <el-button type="success" :loading="joining" :disabled="!inviteCode" @click="handleJoinTeam" style="width: 100%;">
              加入队伍
            </el-button>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 已报名状态 -->
    <el-card v-else shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon size="20" color="#67c23a"><CircleCheck /></el-icon>
          <span>你已报名</span>
          <el-tag :type="getStatusType(myTeam.status)" style="margin-left: auto;">
            {{ getStatusText(myTeam.status) }}
          </el-tag>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="队伍名称">
          <el-text size="large" tag="b">{{ myTeam.display_name }}</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="队员">
          <el-space>
            <el-tag v-for="player in myTeam.players" :key="player.id" :type="player.is_captain ? 'warning' : ''">
              <el-avatar :size="18" :src="player.user?.avatar" style="margin-right: 4px;" />
              {{ player.user?.user_name }}
              <span v-if="player.is_captain"> (队长)</span>
            </el-tag>
          </el-space>
        </el-descriptions-item>
        <el-descriptions-item label="邀请码" v-if="myTeam.invite_code && isCaptain">
          <el-input :value="myTeam.invite_code" readonly style="max-width: 200px;">
            <template #append>
              <el-button @click="copyInviteCode">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <el-popconfirm 
        :title="isCaptain && myTeam.players?.length === 1 ? '确定解散队伍？' : '确定退出队伍？'"
        @confirm="handleLeaveTeam"
      >
        <template #reference>
          <el-button type="danger" :loading="leaving" plain>
            {{ isCaptain && myTeam.players?.length === 1 ? '解散队伍' : '退出队伍' }}
          </el-button>
        </template>
      </el-popconfirm>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { getTeams, createTeam, joinTeam, leaveTeam } from '@/api/tournament'
import { Plus, Link, CircleCheck, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  tournament: { type: Object, default: null }
})

const emit = defineEmits(['refresh'])

const route = useRoute()
const store = useStore()

// 响应式状态
const teamName = ref('')
const inviteCode = ref('')
const myTeam = ref(null)
const creating = ref(false)
const joining = ref(false)
const leaving = ref(false)

// 计算属性
const userId = computed(() => store.state.userId)

const isCaptain = computed(() => {
  if (!myTeam.value || !userId.value) return false
  return myTeam.value.captain_id === userId.value
})

// 检查是否已在某个队伍
const checkMyTeam = async () => {
  try {
    const tid = route.params.tid
    const res = await getTeams(tid)
    const teams = res
    myTeam.value = teams.find(team => 
      team.players?.some(p => p.user_id === userId.value)
    ) || null
  } catch (error) {
    console.error('检查队伍失败', error)
  }
}

// 创建队伍
const handleCreateTeam = async () => {
  creating.value = true
  try {
    const tid = route.params.tid
    await createTeam(tid, { name: teamName.value })
    ElMessage.success('队伍创建成功')
    await checkMyTeam()
    emit('refresh')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '创建失败')
  } finally {
    creating.value = false
  }
}

// 加入队伍
const handleJoinTeam = async () => {
  joining.value = true
  try {
    const tid = route.params.tid
    await joinTeam(tid, inviteCode.value)
    ElMessage.success('加入成功')
    await checkMyTeam()
    emit('refresh')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '加入失败')
  } finally {
    joining.value = false
  }
}

// 退出队伍
const handleLeaveTeam = async () => {
  leaving.value = true
  try {
    const tid = route.params.tid
    await leaveTeam(tid)
    ElMessage.success('已退出队伍')
    myTeam.value = null
    emit('refresh')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '退出失败')
  } finally {
    leaving.value = false
  }
}

// 复制邀请码
const copyInviteCode = () => {
  navigator.clipboard.writeText(myTeam.value.invite_code)
  ElMessage.success('邀请码已复制')
}

// 工具函数
const getStatusText = (status) => {
  const map = { 0: '待审核', 1: '已通过', 2: '未通过' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

onMounted(() => {
  checkMyTeam()
})
</script>

<style scoped>
.register-page {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}
</style>
