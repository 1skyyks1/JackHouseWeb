<template>
  <div class="container">
    <navMenu></navMenu>
    <el-row :gutter="10">
      <el-col :xl="4" :lg="4" :md="4" :sm="2" :xs="2" class="admin-menu-col">
        <adminMenu></adminMenu>
      </el-col>
      <el-col :xl="20" :lg="20" :md="20" :sm="22" :xs="22">
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
.container{
  height: 100%;
}
.admin-menu-col {
  height: calc(100vh - 80px);
  position: sticky;
  top: 70px;
}
</style>