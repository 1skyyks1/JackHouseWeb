<template>
  <div class="overview" :class="{ 'mobile-view': isMobile }">
    <!-- 赛事简介 -->
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>赛事简介</span>
        </div>
      </template>
      <el-text>{{ props.tournament?.desc || '暂无简介' }}</el-text>
    </el-card>

    <!-- 时间安排 -->
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <el-icon><Clock /></el-icon>
          <span>时间安排</span>
        </div>
      </template>
      <div class="schedule-grid">
        <div class="schedule-item" v-if="props.tournament?.reg_start">
          <div class="schedule-label">
            <el-tag type="primary" effect="dark">报名</el-tag>
          </div>
          <div class="schedule-time">
            <span class="date">{{ formatDate(props.tournament.reg_start) }}</span>
            <span class="separator">/</span>
            <span class="date">{{ formatDate(props.tournament.reg_end) }}</span>
          </div>
        </div>
        <div class="schedule-item" v-if="props.tournament?.qual_start">
          <div class="schedule-label">
            <el-tag type="warning" effect="dark">资格赛</el-tag>
          </div>
          <div class="schedule-time">
            <span class="date">{{ formatDate(props.tournament.qual_start) }}</span>
            <span class="separator">/</span>
            <span class="date">{{ formatDate(props.tournament.qual_end) }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 工作人员 -->
    <el-card shadow="never" class="section-card" v-if="props.tournament?.staff?.length">
      <template #header>
        <div class="card-header">
          <el-icon><UserFilled /></el-icon>
          <span>工作人员</span>
        </div>
      </template>
      <div class="staff-grid" :class="{ 'single-column': isSmallMobile }">
        <div class="staff-card" v-for="s in props.tournament.staff" :key="s.id">
          <el-avatar :size="48" :src="s.user?.avatar" />
          <div class="staff-info">
            <span class="staff-name">{{ s.user?.user_name }}</span>
            <el-tag :type="getRoleType(s.role)" size="small">{{ getRoleName(s.role) }}</el-tag>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { Document, Clock, UserFilled } from '@element-plus/icons-vue'
import { useBreakpoints } from '@vueuse/core'

const props = defineProps({
  tournament: { type: Object, default: null }
})

// 断点响应式
const breakpoints = useBreakpoints({ tablet: 768, mobile: 480 })
const isMobile = breakpoints.smaller('tablet')
const isSmallMobile = breakpoints.smaller('mobile')

// 格式化日期 (YYYY-MM-DD)
const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getRoleName = (role) => {
  const map = { host: '主办', referee: '裁判', pooler: '选图', streamer: '直播', commentator: '解说' }
  return map[role] || role
}

const getRoleType = (role) => {
  const map = { host: 'danger', referee: 'warning', pooler: 'success', streamer: 'primary', commentator: '' }
  return map[role] || ''
}
</script>

<style scoped>
.overview {
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

/* 时间安排网格 */
.schedule-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.schedule-label {
  min-width: 70px;
}

.schedule-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--el-text-color-primary);
}

.schedule-time .date {
  font-weight: 500;
}

.schedule-time .separator {
  color: var(--el-text-color-secondary);
}

/* 工作人员网格 */
.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.staff-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  transition: transform 0.2s;
}

.staff-card:hover {
  transform: translateY(-2px);
}

.staff-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.staff-name {
  font-weight: 600;
  font-size: 0.9rem;
}

/* 移动端适配（通过 JS 动态 class 控制） */
.mobile-view .schedule-item {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.mobile-view .staff-grid {
  grid-template-columns: repeat(2, 1fr);
}

.mobile-view .staff-card {
  padding: 0.5rem;
}

.staff-grid.single-column {
  grid-template-columns: 1fr;
}
</style>
