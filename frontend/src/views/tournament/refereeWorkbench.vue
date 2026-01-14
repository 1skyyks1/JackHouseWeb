<template>
  <div class="referee-workbench" v-if="data">
    <!-- 顶栏：比赛信息 -->
    <el-header class="match-header">
      <div class="team team1">
        <span class="name">{{ data.match.team1?.display_name }}</span>
        <el-statistic :value="data.match.team1_score" class="score red" />
      </div>
      <div class="vs-info">
        <el-tag>{{ data.match.round?.name }}</el-tag>
        <span class="bo">BO{{ (data.match.round?.first_to * 2) - 1 }}</span>
      </div>
      <div class="team team2">
        <el-statistic :value="data.match.team2_score" class="score blue" />
        <span class="name">{{ data.match.team2?.display_name }}</span>
      </div>
    </el-header>

    <el-container class="workbench-body">
      <!-- 左侧：指令面板 -->
      <el-aside width="220px" class="command-panel">
        <el-divider content-position="left">快捷指令</el-divider>
        <el-space direction="vertical" :fill="true" style="width: 100%;">
          <el-button @click="copyText(data.commands.createRoom)" plain>
            <el-icon><House /></el-icon> 创建房间
          </el-button>
          <el-button v-for="inv in data.commands.invite" :key="inv" @click="copyText(inv)" size="small" plain>
            <el-icon><Message /></el-icon> {{ inv.replace('!mp invite ', '') }}
          </el-button>
          <el-button @click="copyText(data.commands.settings)" plain>
            <el-icon><Setting /></el-icon> 房间设置
          </el-button>
          <el-button @click="copyText(data.commands.timer)" type="warning" plain>
            <el-icon><Timer /></el-icon> !mp timer 150
          </el-button>
          <el-button @click="copyText(data.commands.start)" type="success" plain>
            <el-icon><VideoPlay /></el-icon> !mp start 10
          </el-button>
          <el-button @click="copyText(data.commands.abort)" type="danger" plain>
            <el-icon><VideoPause /></el-icon> !mp abort
          </el-button>
        </el-space>

        <el-divider content-position="left">房间名</el-divider>
        <el-input :value="data.roomName" readonly size="small">
          <template #append>
            <el-button @click="copyText(data.roomName)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </template>
        </el-input>

        <el-divider content-position="left">技术暂停</el-divider>
        <el-button-group style="width: 100%;">
          <el-button 
            type="danger" 
            :disabled="data.match.team1_timeout_used"
            @click="useTimeout(1)"
            style="width: 50%;"
          >
            红队 {{ data.match.team1_timeout_used ? '✓' : '' }}
          </el-button>
          <el-button 
            type="primary" 
            :disabled="data.match.team2_timeout_used"
            @click="useTimeout(2)"
            style="width: 50%;"
          >
            蓝队 {{ data.match.team2_timeout_used ? '✓' : '' }}
          </el-button>
        </el-button-group>
      </el-aside>

      <!-- 中间：主操作区 -->
      <el-main class="main-area">
        <!-- Roll 点输入 -->
        <el-card v-if="!data.match.team1_roll" shadow="never" class="roll-card">
          <template #header>Roll 点</template>
          <el-row :gutter="20">
            <el-col :span="10">
              <el-input-number v-model="rollTeam1" :min="0" :max="100" placeholder="红队 Roll" controls-position="right" style="width: 100%;" />
              <el-text type="secondary" size="small">{{ data.match.team1?.display_name }}</el-text>
            </el-col>
            <el-col :span="4" style="text-align: center;">
              <el-button type="primary" @click="submitRoll" :disabled="!rollTeam1 || !rollTeam2">
                确认
              </el-button>
            </el-col>
            <el-col :span="10">
              <el-input-number v-model="rollTeam2" :min="0" :max="100" placeholder="蓝队 Roll" controls-position="right" style="width: 100%;" />
              <el-text type="secondary" size="small">{{ data.match.team2?.display_name }}</el-text>
            </el-col>
          </el-row>
        </el-card>

        <!-- Roll 结果 -->
        <el-alert v-else type="success" :closable="false" show-icon>
          <template #title>
            {{ data.match.team1?.display_name }}: {{ data.match.team1_roll }} vs 
            {{ data.match.team2?.display_name }}: {{ data.match.team2_roll }}
            ({{ highRoller === 1 ? data.match.team1?.display_name : data.match.team2?.display_name }} 先 Protect)
          </template>
        </el-alert>

        <!-- 当前阶段 -->
        <el-card shadow="never">
          <template #header>
            <el-tag :type="currentPhase === 'pick' ? 'primary' : currentPhase === 'ban' ? 'danger' : 'success'" size="large">
              {{ currentPhaseText }}
            </el-tag>
            <span style="margin-left: 12px;">
              操作队伍：
              <el-tag :type="currentActionTeam === 1 ? 'danger' : 'primary'" effect="dark">
                {{ currentActionTeam === 1 ? data.match.team1?.display_name : data.match.team2?.display_name }}
              </el-tag>
            </span>
          </template>

          <!-- 图池选择 -->
          <el-space wrap :size="8">
            <el-button
              v-for="map in data.match.round?.mappool" 
              :key="map.id"
              :type="getMapBtnType(map)"
              :disabled="isMapUsed(map)"
              :plain="!isSelected(map)"
              @click="selectMap(map)"
            >
              {{ map.type }}
              <el-tag v-if="getMapStatusTag(map)" :type="getMapStatusTagType(map)" size="small" style="margin-left: 4px;">
                {{ getMapStatusTag(map) }}
              </el-tag>
            </el-button>
          </el-space>

          <!-- 操作按钮 -->
          <el-divider v-if="selectedMap" />
          <div v-if="selectedMap" class="action-section">
            <el-text type="primary" tag="b">已选：{{ selectedMap.type }} - {{ selectedMap.title }}</el-text>
            <el-button-group style="margin-left: 16px;">
              <el-button type="success" v-if="currentPhase === 'protect'" @click="doAction(0)">Protect</el-button>
              <el-button type="danger" v-if="currentPhase === 'ban'" @click="doAction(1)">Ban</el-button>
              <el-button type="primary" v-if="currentPhase === 'pick'" @click="doAction(2)">Pick</el-button>
            </el-button-group>
          </div>
        </el-card>

        <!-- 撤销 -->
        <el-button type="info" plain @click="undo" style="margin-top: 12px;">
          <el-icon><RefreshLeft /></el-icon> 撤销上一步
        </el-button>
      </el-main>

      <!-- 右侧：对局记录 -->
      <el-aside width="280px" class="games-panel">
        <el-divider content-position="left">对局记录</el-divider>
        <el-timeline>
          <el-timeline-item 
            v-for="game in data.match.games" 
            :key="game.id"
            :type="game.action_type === 0 ? 'success' : game.action_type === 1 ? 'danger' : 'primary'"
            :hollow="true"
          >
            <el-card shadow="never" :body-style="{ padding: '8px 12px' }">
              <div class="game-item">
                <el-tag :type="game.action_by === 1 ? 'danger' : 'primary'" size="small" effect="dark">
                  {{ game.action_by === 1 ? '红' : '蓝' }}
                </el-tag>
                <span class="map">{{ game.map?.type }}</span>
                <span class="action">{{ getActionText(game.action_type) }}</span>
                <span v-if="game.player1_score" class="score">
                  {{ game.player1_score }} - {{ game.player2_score }}
                </span>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>

        <el-divider content-position="left">获取分数</el-divider>
        <el-input v-model.number="mpId" placeholder="MP 房间 ID" style="margin-bottom: 8px;" />
        <el-button type="primary" :loading="fetching" :disabled="!mpId" @click="fetchScores" style="width: 100%;">
          从 MP 获取分数
        </el-button>
      </el-aside>
    </el-container>
  </div>

  <div v-else-if="loading" v-loading="loading" style="min-height: 100vh;"></div>
  <el-result v-else icon="warning" title="无法加载工作台" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getRefereeData, recordRoll, recordAction, recordTimeout, undoLastAction, updateMatch, fetchMatchScores } from '@/api/tournament'
import { House, Message, Setting, Timer, VideoPlay, VideoPause, CopyDocument, RefreshLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  tid: { type: [String, Number], required: true },
  matchId: { type: [String, Number], required: true }
})

// 响应式状态
const data = ref(null)
const loading = ref(true)
const rollTeam1 = ref(null)
const rollTeam2 = ref(null)
const selectedMap = ref(null)
const mpId = ref(null)
const fetching = ref(false)

// 计算属性
const highRoller = computed(() => {
  if (!data.value?.match) return 0
  return data.value.match.team1_roll > data.value.match.team2_roll ? 1 : 2
})

const currentPhase = computed(() => {
  const games = data.value?.match?.games || []
  const protects = games.filter(g => g.action_type === 0).length
  const bans = games.filter(g => g.action_type === 1).length
  if (protects < 2) return 'protect'
  if (bans < 2) return 'ban'
  return 'pick'
})

const currentPhaseText = computed(() => {
  const map = { protect: 'Protect 阶段', ban: 'Ban 阶段', pick: 'Pick 阶段' }
  return map[currentPhase.value]
})

const currentActionTeam = computed(() => {
  const games = data.value?.match?.games || []
  const phase = currentPhase.value
  
  if (phase === 'protect') {
    const protects = games.filter(g => g.action_type === 0).length
    return protects === 0 ? highRoller.value : (highRoller.value === 1 ? 2 : 1)
  } else if (phase === 'ban') {
    const bans = games.filter(g => g.action_type === 1).length
    const lowRoller = highRoller.value === 1 ? 2 : 1
    return bans === 0 ? lowRoller : (lowRoller === 1 ? 2 : 1)
  } else {
    const picks = games.filter(g => g.action_type === 2).length
    return picks % 2 === 0 ? highRoller.value : (highRoller.value === 1 ? 2 : 1)
  }
})

// 获取数据
const fetchData = async () => {
  try {
    loading.value = true
    const res = await getRefereeData(props.tid, props.matchId)
    data.value = res
    mpId.value = data.value.match.mp_id
  } catch (error) {
    console.error('获取工作台数据失败', error)
  } finally {
    loading.value = false
  }
}

// 复制文本
const copyText = (text) => {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制')
}

// 提交 Roll
const submitRoll = async () => {
  try {
    await recordRoll(props.tid, props.matchId, rollTeam1.value, rollTeam2.value)
    await fetchData()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '记录失败')
  }
}

// 地图状态判断
const isMapUsed = (map) => {
  const used = data.value.usedMaps
  const allUsed = [...used.team1_protect, ...used.team2_protect, ...used.team1_ban, ...used.team2_ban, ...used.picked]
  return allUsed.includes(map.id)
}

const isSelected = (map) => {
  return selectedMap.value?.id === map.id
}

const getMapBtnType = (map) => {
  const used = data.value.usedMaps
  if (used.team1_protect.includes(map.id) || used.team2_protect.includes(map.id)) return 'success'
  if (used.team1_ban.includes(map.id) || used.team2_ban.includes(map.id)) return 'danger'
  if (used.picked.includes(map.id)) return 'info'
  return ''
}

const getMapStatusTag = (map) => {
  const used = data.value.usedMaps
  if (used.team1_protect.includes(map.id)) return '红P'
  if (used.team2_protect.includes(map.id)) return '蓝P'
  if (used.team1_ban.includes(map.id)) return '红B'
  if (used.team2_ban.includes(map.id)) return '蓝B'
  if (used.picked.includes(map.id)) return '✓'
  return null
}

const getMapStatusTagType = (map) => {
  const used = data.value.usedMaps
  if (used.team1_protect.includes(map.id) || used.team1_ban.includes(map.id)) return 'danger'
  if (used.team2_protect.includes(map.id) || used.team2_ban.includes(map.id)) return 'primary'
  return 'info'
}

const selectMap = (map) => {
  if (isMapUsed(map)) return
  selectedMap.value = map
}

// 执行操作
const doAction = async (actionType) => {
  if (!selectedMap.value) return
  try {
    await recordAction(props.tid, props.matchId, selectedMap.value.id, actionType, currentActionTeam.value)
    selectedMap.value = null
    await fetchData()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  }
}

// 使用暂停
const useTimeout = async (team) => {
  try {
    await recordTimeout(props.tid, props.matchId, team)
    ElMessage.success('暂停已记录')
    await fetchData()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '记录失败')
  }
}

// 撤销
const undo = async () => {
  await ElMessageBox.confirm('确定撤销上一步操作？', '提示')
  try {
    await undoLastAction(props.tid, props.matchId)
    await fetchData()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '撤销失败')
  }
}

// 获取分数
const fetchScores = async () => {
  if (!mpId.value) return
  try {
    fetching.value = true
    await updateMatch(props.tid, props.matchId, { mp_id: mpId.value })
    await fetchMatchScores(props.tid, props.matchId)
    await fetchData()
    ElMessage.success('分数获取成功')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取失败')
  } finally {
    fetching.value = false
  }
}

// 工具函数
const getActionText = (type) => {
  const map = { 0: 'Protect', 1: 'Ban', 2: 'Pick' }
  return map[type] || '?'
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.referee-workbench {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--el-bg-color);
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--el-bg-color-overlay);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.match-header .team {
  display: flex;
  align-items: center;
  gap: 16px;
}

.match-header .team .name {
  font-size: 1.25rem;
  font-weight: 600;
}

.match-header .score :deep(.el-statistic__number) {
  font-size: 2rem;
  font-weight: 700;
}

.match-header .score.red :deep(.el-statistic__number) {
  color: var(--el-color-danger);
}

.match-header .score.blue :deep(.el-statistic__number) {
  color: var(--el-color-primary);
}

.vs-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bo {
  font-size: 0.875rem;
  color: var(--el-text-color-secondary);
}

.workbench-body {
  flex: 1;
  overflow: hidden;
}

.command-panel, .games-panel {
  padding: 16px;
  background: var(--el-bg-color-overlay);
  overflow-y: auto;
}

.main-area {
  padding: 16px;
  overflow-y: auto;
}

.roll-card {
  margin-bottom: 16px;
}

.action-section {
  display: flex;
  align-items: center;
}

.game-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.game-item .map {
  font-weight: 600;
}

.game-item .score {
  margin-left: auto;
  font-weight: 500;
}
</style>
