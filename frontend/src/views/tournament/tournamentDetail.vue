<template>
  <div class="tournament-detail" :class="{ 'mobile-view': isMobile }" v-if="tournament">
    <!-- 横幅 -->
    <div class="banner-section">
      <el-image v-if="tournament.banner" :src="tournament.banner" fit="cover" class="banner-img" />
      <div v-else class="banner-placeholder">
        <span>{{ tournament.acronym }}</span>
      </div>
      <div class="banner-overlay">
        <div class="banner-content">
          <el-tag :type="getStatusType(tournament.status)" size="large">{{ getStatusText(tournament.status) }}</el-tag>
          <h1>{{ tournament.name }}</h1>
          <p>{{ tournament.acronym }}</p>
        </div>
      </div>
    </div>

    <!-- 导航标签 -->
    <div class="nav-container">
      <el-menu mode="horizontal" :default-active="activeTab" router :ellipsis="false">
        <el-menu-item :index="`/t/${props.tid}`">
          <el-icon><House /></el-icon>
          <span class="menu-text" v-show="!isMobile || activeTab === `/t/${props.tid}`">概览</span>
        </el-menu-item>
        <el-menu-item :index="`/t/${props.tid}/register`">
          <el-icon><Edit /></el-icon>
          <span class="menu-text" v-show="!isMobile || activeTab === `/t/${props.tid}/register`">报名</span>
        </el-menu-item>
        <el-menu-item :index="`/t/${props.tid}/teams`">
          <el-icon><User /></el-icon>
          <span class="menu-text" v-show="!isMobile || activeTab === `/t/${props.tid}/teams`">队伍</span>
        </el-menu-item>
        <el-menu-item :index="`/t/${props.tid}/qualifier`">
          <el-icon><List /></el-icon>
          <span class="menu-text" v-show="!isMobile || activeTab === `/t/${props.tid}/qualifier`">资格赛</span>
        </el-menu-item>
        <el-menu-item :index="`/t/${props.tid}/bracket`">
          <el-icon><DataLine /></el-icon>
          <span class="menu-text" v-show="!isMobile || activeTab === `/t/${props.tid}/bracket`">对阵表</span>
        </el-menu-item>
        <el-menu-item :index="`/t/${props.tid}/ranking`">
          <el-icon><Trophy /></el-icon>
          <span class="menu-text" v-show="!isMobile || activeTab === `/t/${props.tid}/ranking`">排名</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 路由内容 -->
    <div class="content-section">
      <router-view :tournament="tournament" @refresh="fetchTournament" />
    </div>
  </div>
  
  <div v-else-if="loading" class="loading-container">
    <el-skeleton :rows="5" animated />
  </div>
  
  <el-result v-else icon="warning" title="赛事不存在" sub-title="请检查链接是否正确">
    <template #extra>
      <el-button type="primary" @click="router.push('/t')">返回赛事列表</el-button>
    </template>
  </el-result>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBreakpoints } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
import { getTournament } from '@/api/tournament'
import { House, User, List, DataLine, Edit, Trophy } from '@element-plus/icons-vue'

const props = defineProps({
  tid: { type: [String, Number], required: true }
})

const router = useRouter()
const route = useRoute()

// 断点响应式
const breakpoints = useBreakpoints({ tablet: 768 })
const isMobile = breakpoints.smaller('tablet')

// 响应式状态
const tournament = ref(null)
const loading = ref(true)

// 计算属性
const isRegOpen = computed(() => {
  if (!tournament.value) return false
  const now = new Date()
  const start = new Date(tournament.value.reg_start)
  const end = new Date(tournament.value.reg_end)
  return now >= start && now <= end
})

const activeTab = computed(() => route.path)

// 获取赛事信息
const fetchTournament = async () => {
  try {
    loading.value = true
    const res = await getTournament(props.tid)
    tournament.value = res
  } catch (error) {
    tournament.value = null
  } finally {
    loading.value = false
  }
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

// 监听 tid 变化
watch(() => props.tid, () => {
  fetchTournament()
})

onMounted(() => {
  fetchTournament()
})
</script>

<style scoped>
.tournament-detail {
  min-height: 100vh;
  margin-top: -60px;
}

.banner-section {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 100%;
}

.banner-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-placeholder span {
  font-size: 5rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.2);
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 3rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
}

.banner-content {
  max-width: 1200px;
  margin: 0 auto;
}

.banner-content h1 {
  font-size: 2.5rem;
  margin: 1rem 0 0.5rem 0;
  color: white;
}

.banner-content p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
}

.nav-container {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--el-bg-color);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  padding: 0 calc((100% - 1200px) / 2 + 1rem);
}

.nav-container .el-menu {
  border-bottom: none;
  background: transparent;
}

.content-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.loading-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

/* 移动端适配（通过 JS 动态 class 控制） */
.mobile-view .banner-section {
  height: 200px;
}

.mobile-view .banner-overlay {
  padding: 1.5rem;
}

.mobile-view .banner-content h1 {
  font-size: 1.5rem;
}

.mobile-view .banner-content p {
  font-size: 0.9rem;
}

.mobile-view .nav-container {
  padding: 0 0.5rem;
  overflow-x: auto;
}

.mobile-view .nav-container .el-menu {
  flex-wrap: nowrap;
}

.mobile-view .content-section {
  padding: 0.75rem;
}

/* 移动端导航：只显示图标，选中项显示文字 */
.mobile-view .nav-container {
  padding: 0;
  overflow-x: visible;
}

.mobile-view .nav-container .el-menu {
  justify-content: center;
}

.mobile-view .el-menu-item {
  padding: 0 12px;
}
</style>
