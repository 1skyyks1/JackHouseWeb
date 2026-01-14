<template>
  <div class="qualifier-page" :class="{ 'mobile-view': isMobile }">
    <!-- 图池展示 -->
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <el-icon><Headset /></el-icon>
          <span>资格赛图池</span>
        </div>
      </template>

      <el-row :gutter="16" v-if="mappool.length">
        <el-col :xs="12" :sm="8" :md="6" v-for="map in mappool" :key="map.id">
          <el-card class="map-card" :body-style="{ padding: '0' }" shadow="hover">
            <div class="map-cover">
              <el-image 
                :src="`https://assets.ppy.sh/beatmaps/${map.map_id}/covers/cover.jpg`" 
                fit="cover" 
                lazy 
              />
              <el-tag class="map-index" type="danger" effect="dark">Stage {{ map.index }}</el-tag>
              <el-tag v-if="props.tournament?.qual_rank_mode === 1" class="map-weight" type="warning" effect="dark">
                {{ map.weight }}x
              </el-tag>
            </div>
            <div class="map-info">
              <el-text class="map-title" truncated>{{ map.title }}</el-text>
              <el-text type="secondary" size="small" truncated>{{ map.artist }}</el-text>
              <el-text type="info" size="small">by {{ map.mapper }}</el-text>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-else description="图池暂未公布" />
    </el-card>

    <!-- 排名榜 -->
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <el-icon><Trophy /></el-icon>
          <span>资格赛排名</span>
        </div>
      </template>

      <el-table :data="ranking" v-loading="loading" stripe style="width: 100%">
        <el-table-column label="排名" width="80" align="center">
          <template #default="{ row }">
            <el-tag 
              v-if="row.qual_rank <= 3" 
              :type="row.qual_rank === 1 ? 'danger' : row.qual_rank === 2 ? 'warning' : ''" 
              effect="dark"
              round
            >
              {{ row.qual_rank }}
            </el-tag>
            <span v-else>{{ row.qual_rank }}</span>
          </template>
        </el-table-column>
        <el-table-column label="队伍" min-width="200">
          <template #default="{ row }">
            <div class="team-cell">
              <span class="team-name">{{ row.display_name }}</span>
              <el-text type="secondary" size="small">
                {{ row.players?.map(p => p.user?.user_name).join(' / ') }}
              </el-text>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="总分" width="140" align="right">
          <template #default="{ row }">
            <el-statistic :value="row.qual_score || 0" :precision="0" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.qual_rank <= qualTopN" type="success" effect="plain">晋级</el-tag>
            <el-tag v-else type="info" effect="plain">淘汰</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && !ranking.length" description="暂无排名数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBreakpoints } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { getQualMappool, getQualRanking } from '@/api/tournament'
import { Headset, Trophy } from '@element-plus/icons-vue'

const props = defineProps({
  tournament: { type: Object, default: null }
})

const route = useRoute()

// 断点响应式
const breakpoints = useBreakpoints({ tablet: 768 })
const isMobile = breakpoints.smaller('tablet')

// 响应式状态
const mappool = ref([])
const ranking = ref([])
const loading = ref(true)

// 计算属性
const qualTopN = computed(() => props.tournament?.qual_top_n || 32)

// 获取资格赛数据
const fetchData = async () => {
  const tid = route.params.tid
  try {
    const [mappoolRes, rankingRes] = await Promise.all([
      getQualMappool(tid),
      getQualRanking(tid)
    ])
    mappool.value = mappoolRes
    ranking.value = rankingRes
  } catch (error) {
    console.error('获取资格赛数据失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.qualifier-page {
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

.map-card {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
}

.map-cover {
  position: relative;
  height: 80px;
}

.map-cover .el-image {
  width: 100%;
  height: 100%;
}

.map-index {
  position: absolute;
  top: 8px;
  left: 8px;
}

.map-weight {
  position: absolute;
  top: 8px;
  right: 8px;
}

.map-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.map-title {
  font-weight: 600;
}

.team-cell {
  display: flex;
  flex-direction: column;
}

.team-name {
  font-weight: 600;
}

/* 移动端适配（通过 JS 动态 class 控制） */
.mobile-view .map-card {
  margin-bottom: 12px;
}

.mobile-view .map-cover {
  height: 60px;
}

.mobile-view .map-info {
  padding: 8px;
}

.mobile-view :deep(.el-table) {
  font-size: 0.85rem;
}
</style>
