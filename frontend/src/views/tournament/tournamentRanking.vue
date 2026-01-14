<template>
  <div class="ranking-page">
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <el-icon><Trophy /></el-icon>
          <span>选手排名</span>
        </div>
      </template>
      <el-empty description="排名功能开发中，敬请期待" />
    </el-card>
  </div>
</template>

<script setup>
import { Trophy } from '@element-plus/icons-vue'

defineProps({
  tournament: { type: Object, default: null }
})
</script>

<style scoped>
.ranking-page {
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
</style>
