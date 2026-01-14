<template>
  <div class="bracket-page" :class="{ 'mobile-view': isMobile }">
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <el-icon><Connection /></el-icon>
          <span>对阵表</span>
          <el-segmented v-model="viewMode" :options="viewOptions" style="margin-left: auto;" />
        </div>
      </template>

      <div v-if="loading" v-loading="loading" style="min-height: 200px;"></div>

      <el-empty v-else-if="!matches.length" description="对阵表暂未生成" />

      <!-- 列表视图 -->
      <el-table v-else-if="viewMode === 'list'" :data="matches" stripe>
        <el-table-column label="轮次" width="120">
          <template #default="{ row }">
            <el-tag :type="row.round?.bracket_type === 0 ? 'primary' : 'warning'" size="small">
              {{ row.round?.bracket_type === 0 ? 'W' : 'L' }}
            </el-tag>
            {{ row.round?.name }}
          </template>
        </el-table-column>
        <el-table-column label="对阵" min-width="300">
          <template #default="{ row }">
            <div class="match-vs">
              <span :class="{ winner: row.winner_id === row.team1_id }">
                {{ row.team1?.display_name || 'TBD' }}
              </span>
              <el-tag type="info" size="small">VS</el-tag>
              <span :class="{ winner: row.winner_id === row.team2_id }">
                {{ row.team2?.display_name || 'TBD' }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="比分" width="100" align="center">
          <template #default="{ row }">
            <span class="score">{{ row.team1_score }} - {{ row.team2_score }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="goToMatch(row.id)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 图形视图 -->
      <div v-else class="bracket-view">
        <!-- 胜者组 -->
        <div class="bracket-section" v-if="winnersRounds.length">
          <h4>胜者组</h4>
          <div class="bracket-rounds">
            <div class="bracket-round" v-for="round in winnersRounds" :key="round.id">
              <el-text type="info" size="small" class="round-label">{{ round.name }}</el-text>
              <div 
                class="match-box" 
                v-for="match in getMatchesByRound(round.id)" 
                :key="match.id"
                @click="goToMatch(match.id)"
              >
                <div class="team" :class="{ winner: match.winner_id === match.team1_id }">
                  <span>{{ match.team1?.display_name || 'TBD' }}</span>
                  <span class="score">{{ match.team1_score }}</span>
                </div>
                <div class="team" :class="{ winner: match.winner_id === match.team2_id }">
                  <span>{{ match.team2?.display_name || 'TBD' }}</span>
                  <span class="score">{{ match.team2_score }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 败者组 -->
        <div class="bracket-section" v-if="losersRounds.length">
          <h4>败者组</h4>
          <div class="bracket-rounds">
            <div class="bracket-round" v-for="round in losersRounds" :key="round.id">
              <el-text type="info" size="small" class="round-label">{{ round.name }}</el-text>
              <div 
                class="match-box" 
                v-for="match in getMatchesByRound(round.id)" 
                :key="match.id"
                @click="goToMatch(match.id)"
              >
                <div class="team" :class="{ winner: match.winner_id === match.team1_id }">
                  <span>{{ match.team1?.display_name || 'TBD' }}</span>
                  <span class="score">{{ match.team1_score }}</span>
                </div>
                <div class="team" :class="{ winner: match.winner_id === match.team2_id }">
                  <span>{{ match.team2?.display_name || 'TBD' }}</span>
                  <span class="score">{{ match.team2_score }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBreakpoints } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { getRounds, getBracket } from '@/api/tournament'
import { Connection } from '@element-plus/icons-vue'

const props = defineProps({
  tournament: { type: Object, default: null }
})

const route = useRoute()
const router = useRouter()

// 断点响应式
const breakpoints = useBreakpoints({ tablet: 768 })
const isMobile = breakpoints.smaller('tablet')

// 响应式状态
const rounds = ref([])
const matches = ref([])
const loading = ref(true)
const viewMode = ref('list')
const viewOptions = [
  { label: '列表', value: 'list' },
  { label: '图形', value: 'bracket' }
]

// 计算属性
const winnersRounds = computed(() => rounds.value.filter(r => r.bracket_type === 0))
const losersRounds = computed(() => rounds.value.filter(r => r.bracket_type === 1))

// 获取数据
const fetchData = async () => {
  const tid = route.params.tid
  try {
    const [roundsRes, bracketRes] = await Promise.all([
      getRounds(tid),
      getBracket(tid)
    ])
    rounds.value = roundsRes
    matches.value = bracketRes
  } catch (error) {
    console.error('获取对阵表失败', error)
  } finally {
    loading.value = false
  }
}

// 工具函数
const getMatchesByRound = (roundId) => {
  return matches.value.filter(m => m.round?.id === roundId)
}

const goToMatch = (matchId) => {
  const tid = route.params.tid
  router.push(`/t/${tid}/match/${matchId}`)
}

const getStatusText = (status) => {
  const map = { 0: '待开始', 1: '进行中', 2: '已结束' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = { 0: 'info', 1: 'warning', 2: 'success' }
  return map[status] || ''
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.bracket-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.match-vs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.match-vs .winner {
  font-weight: 700;
  color: var(--el-color-success);
}

.score {
  font-weight: 700;
  font-size: 1.1em;
}

/* 图形视图样式 */
.bracket-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.bracket-section h4 {
  margin: 0 0 1rem 0;
  color: var(--el-text-color-secondary);
}

.bracket-rounds {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.bracket-round {
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.round-label {
  text-align: center;
  display: block;
  margin-bottom: 0.5rem;
}

.match-box {
  background: var(--el-fill-color-light);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.match-box:hover {
  transform: translateY(-2px);
  box-shadow: var(--el-box-shadow-light);
}

.match-box .team {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.match-box .team:last-child {
  border-bottom: none;
}

.match-box .team.winner {
  background: var(--el-color-success-light-9);
  font-weight: 600;
}

.match-box .team .score {
  font-weight: 700;
}

/* 移动端适配（通过 JS 动态 class 控制） */
.mobile-view .bracket-rounds {
  gap: 1rem;
}

.mobile-view .bracket-round {
  min-width: 150px;
}

.mobile-view .match-box .team {
  padding: 6px 10px;
  font-size: 0.8rem;
}

.mobile-view :deep(.el-table) {
  font-size: 0.85rem;
}
</style>
