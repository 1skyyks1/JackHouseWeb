<template>
  <el-card shadow="never" class="main-card">
    <template #header>

    </template>
    <div>
      <el-scrollbar max-height="80vh">
        <p v-for="item in 5" :key="item" class="scrollbar-demo-item">{{ item }}</p>
      </el-scrollbar>
    </div>
  </el-card>
</template>

<script setup>

</script>

<style scoped>
.main-card{
  height: calc(100vh - 80px);
}
</style>