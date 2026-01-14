<template>
  <div>
    <navMenu></navMenu>
    <div class="tournament-list">
      <div class="page-header">
        <h1>赛事中心</h1>
        <p>参与精彩赛事，展现你的实力</p>
      </div>

      <el-row :gutter="20" v-if="tournaments.length">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="t in tournaments" :key="t.id">
          <el-card 
            class="tournament-card" 
            :body-style="{ padding: '0' }"
            shadow="hover"
            @click="goToTournament(t.acronym)"
          >
            <div class="card-banner">
              <el-image v-if="t.banner" :src="t.banner" fit="cover" class="banner-img" />
              <div v-else class="placeholder-banner">{{ t.acronym }}</div>
            </div>
            <div class="card-content">
              <div class="card-header">
                <el-tag size="small" type="primary">{{ t.acronym }}</el-tag>
                <el-tag size="small" :type="getStatusType(t.status)">{{ getStatusText(t.status) }}</el-tag>
              </div>
              <h3 class="card-title">{{ t.name }}</h3>
              <el-text type="secondary" class="card-desc" truncated>
                {{ t.desc || '暂无简介' }}
              </el-text>
              <div class="card-meta">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(t.reg_start) }} - {{ formatDate(t.reg_end) }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-else-if="!loading" description="暂无赛事" />
      
      <div class="loading-wrapper" v-if="loading">
        <el-skeleton :rows="3" animated />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTournaments } from '@/api/tournament'
import { Calendar } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import navMenu from '@/components/navmenu.vue'

const router = useRouter()

// 响应式状态
const tournaments = ref([])
const loading = ref(true)

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

// 跳转到赛事详情（使用小写 acronym）
const goToTournament = (acronym) => {
  router.push(`/t/${acronym.toLowerCase()}`)
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
  return new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

onMounted(() => {
  fetchTournaments()
})
</script>

<style scoped>
.tournament-list {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 2rem 2rem 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-header p {
  color: var(--el-text-color-secondary);
}

.tournament-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
  border-radius: 12px;
  overflow: hidden;
}

.tournament-card:hover {
  transform: translateY(-4px);
}

.card-banner {
  height: 140px;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 100%;
}

.placeholder-banner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-size: 2rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.5);
}

.card-content {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-title {
  font-size: 1.1rem;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.card-desc {
  display: block;
  margin-bottom: 12px;
  font-size: 0.875rem;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--el-text-color-secondary);
}

.loading-wrapper {
  padding: 2rem;
}
</style>
