<template>
  <div class="match-page" v-if="match">
    <el-page-header @back="goBack">
      <template #content>
        <span class="page-title">{{ match.round?.name }}</span>
        <el-tag :type="getStatusType(match.status)" style="margin-left: 12px;">
          {{ getStatusText(match.status) }}
        </el-tag>
      </template>
    </el-page-header>

    <!-- 比赛对阵 -->
    <el-card shadow="never" class="vs-card">
      <div class="vs-section">
        <div class="team team1">
          <h2>{{ match.team1?.display_name }}</h2>
          <div class="team-score">{{ match.team1_score }}</div>
        </div>
        <div class="vs-middle">
          <el-tag type="info" size="large" round>BO{{ (match.round?.first_to * 2) - 1 }}</el-tag>
          <span class="time">{{ formatTime(match.scheduled_time) }}</span>
        </div>
        <div class="team team2">
          <h2>{{ match.team2?.display_name }}</h2>
          <div class="team-score">{{ match.team2_score }}</div>
        </div>
      </div>
    </el-card>

    <!-- 对局记录 -->
    <el-card shadow="never" class="section-card" v-if="match.games?.length">
      <template #header>
        <span>对局记录</span>
      </template>
      <el-table :data="match.games" stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="地图" min-width="200">
          <template #default="{ row }">
            <el-tag :type="getMapType(row.map?.type)" size="small">{{ row.map?.type }}</el-tag>
            {{ row.map?.title }}
          </template>
        </el-table-column>
        <el-table-column :label="match.team1?.display_name" width="150" align="right">
          <template #default="{ row }">
            <el-statistic :value="row.player1_score || 0" :precision="0" :class="{ winner: row.winner_team === 1 }" />
          </template>
        </el-table-column>
        <el-table-column :label="match.team2?.display_name" width="150" align="right">
          <template #default="{ row }">
            <el-statistic :value="row.player2_score || 0" :precision="0" :class="{ winner: row.winner_team === 2 }" />
          </template>
        </el-table-column>
        <el-table-column label="胜者" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.winner_team === 1 ? 'danger' : 'primary'" effect="dark" size="small">
              {{ row.winner_team === 1 ? '红' : '蓝' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 图池 -->
    <el-card shadow="never" class="section-card" v-if="match.round?.mappool?.length">
      <template #header>
        <span>比赛图池</span>
      </template>
      <el-space wrap :size="8">
        <el-tag 
          v-for="map in match.round.mappool" 
          :key="map.id"
          :type="getMapType(map.type)"
          :effect="isMapPlayed(map) ? 'plain' : 'dark'"
          size="large"
        >
          {{ map.type }} - {{ map.title }}
        </el-tag>
      </el-space>
    </el-card>
  </div>

  <div v-else-if="loading" v-loading="loading" style="min-height: 400px;"></div>
  
  <el-result v-else icon="warning" title="比赛不存在" />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMatch } from '@/api/tournament'

const props = defineProps({
  tid: { type: [String, Number], required: true },
  matchId: { type: [String, Number], required: true }
})

const router = useRouter()

// 响应式状态
const match = ref(null)
const loading = ref(true)

// 获取比赛详情
const fetchMatch = async () => {
  try {
    loading.value = true
    const res = await getMatch(props.tid, props.matchId)
    match.value = res
  } catch (error) {
    console.error('获取比赛详情失败', error)
  } finally {
    loading.value = false
  }
}

// 返回对阵表
const goBack = () => {
  router.push(`/t/${props.tid}/bracket`)
}

// 工具函数
const getStatusText = (status) => {
  const map = { 0: '待开始', 1: '进行中', 2: '已结束' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = { 0: 'info', 1: 'warning', 2: 'success' }
  return map[status] || ''
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const getMapType = (type) => {
  if (!type) return ''
  if (type.startsWith('NM')) return 'primary'
  if (type.startsWith('HD')) return 'warning'
  if (type.startsWith('HR')) return 'danger'
  if (type.startsWith('DT')) return 'success'
  if (type.startsWith('FM')) return ''
  if (type.startsWith('TB')) return 'info'
  return ''
}

const isMapPlayed = (map) => {
  return match.value?.games?.some(g => g.map_id === map.id)
}

// 监听 matchId 变化
watch(() => props.matchId, () => {
  fetchMatch()
})

onMounted(() => {
  fetchMatch()
})
</script>

<style scoped>
.match-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-title {
  font-weight: 600;
  font-size: 1.25rem;
}

.vs-card {
  border-radius: 16px;
}

.vs-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
}

.team {
  text-align: center;
  flex: 1;
}

.team h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.team-score {
  font-size: 3rem;
  font-weight: 700;
  color: var(--el-color-primary);
}

.team1 .team-score { color: var(--el-color-danger); }
.team2 .team-score { color: var(--el-color-primary); }

.vs-middle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0 2rem;
}

.time {
  font-size: 0.875rem;
  color: var(--el-text-color-secondary);
}

.section-card {
  border-radius: 12px;
}

.winner :deep(.el-statistic__number) {
  color: var(--el-color-success);
  font-weight: 700;
}
</style>
