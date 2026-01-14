<template>
  <div class="teams-page" :class="{ 'mobile-view': isMobile }">
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <el-icon><User /></el-icon>
          <span>参赛队伍 ({{ teams.length }})</span>
        </div>
      </template>

      <div v-loading="loading" class="teams-grid">
        <div class="team-card" v-for="team in teams" :key="team.id">
          <div class="team-name">{{ team.name }}</div>
          <div class="players-list">
            <div class="player-item" v-for="player in team.players" :key="player.id">
              <el-avatar :size="32" :src="player.user?.avatar" />
              <span class="player-name">{{ player.user?.user_name }}</span>
              <el-tag v-if="player.is_captain" type="warning" size="small">队长</el-tag>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && !teams.length" description="暂无队伍报名" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBreakpoints } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { getTeams } from '@/api/tournament'
import { User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

defineProps({
  tournament: { type: Object, default: null }
})

const route = useRoute()

// 断点响应式
const breakpoints = useBreakpoints({ tablet: 768 })
const isMobile = breakpoints.smaller('tablet')

// 响应式状态
const teams = ref([])
const loading = ref(true)

// 获取队伍列表
const fetchTeams = async () => {
  try {
    loading.value = true
    const tid = route.params.tid
    const res = await getTeams(tid)
    teams.value = res
  } catch (error) {
    ElMessage.error('获取队伍列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTeams()
})
</script>

<style scoped>
.teams-page {
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

/* 队伍网格 */
.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

/* 队伍卡片 */
.team-card {
  background: var(--el-fill-color-light);
  border-radius: 12px;
  padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.team-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.team-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--el-text-color-primary);
}

/* 选手列表 */
.players-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.player-name {
  font-size: 0.9rem;
  color: var(--el-text-color-regular);
}

/* 移动端适配（通过 JS 动态 class 控制） */
.mobile-view .teams-grid {
  grid-template-columns: 1fr;
}

.mobile-view .team-card {
  padding: 0.75rem;
}

.mobile-view .team-name {
  font-size: 1rem;
}
</style>
