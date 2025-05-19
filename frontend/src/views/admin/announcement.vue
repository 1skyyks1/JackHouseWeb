<template>
  <el-card shadow="never" class="main-card">
    <template #header>
      <span>发布公告</span>
      <div>
        <el-input
            v-model="searchQuery"
            placeholder="用户名搜索"
            size="small"
            style="width: 200px; margin-right: 10px"
            @input="handleSearchInput"
            :suffix-icon="Search"
        />
        <el-button type="primary" plain size="small" @click="userAdd = true">
          <el-icon style="margin-right: 3px"><Plus /></el-icon>
          新增用户
        </el-button>
      </div>
    </template>
    <div>
      <el-scrollbar max-height="90%">

      </el-scrollbar>
    </div>
  </el-card>
</template>

<script setup>

import {Plus, Search} from "@element-plus/icons-vue";
</script>

<style scoped>
.main-card{
  height: calc(100vh - 80px);
}
</style>