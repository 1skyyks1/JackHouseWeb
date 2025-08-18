<template>
  <div>
    <navMenu></navMenu>
    <el-row :gutter="10">
      <el-col :xl="4" :lg="4" :md="4" :sm="3" :xs="3" class="admin-menu-col">
        <adminMenu></adminMenu>
      </el-col>
      <el-col :xl="20" :lg="20" :md="20" :sm="21" :xs="21">
        <router-view></router-view>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import navMenu from "@/components/navmenu.vue";
import AdminMenu from "@/components/adminMenu.vue";

</script>

<style scoped>
.admin-menu-col {
  height: calc(100vh - 70px);
  overflow-y: auto;
  position: sticky;
  top: 70px;
}
</style>