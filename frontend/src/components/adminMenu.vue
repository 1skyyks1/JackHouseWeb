<template>
  <el-menu router
           :default-active="route.name"
           mode="vertical"
           class="admin-menu"
           :ellipsis="false">
    <el-menu-item index="dashboard" route="/admin/dashboard">
      <el-icon><Odometer /></el-icon>
      <span>仪表盘</span>
    </el-menu-item>
    <el-menu-item index="announcement" route="/admin/announcement">
      <el-icon><Bell /></el-icon>
      <span>公告管理</span>
    </el-menu-item>
    <el-menu-item index="homeImgs" route="/admin/homeImgs">
      <el-icon><Postcard /></el-icon>
      <span>头图设置</span>
    </el-menu-item>
    <el-menu-item index="users" route="/admin/users">
      <el-icon><User /></el-icon>
      <span>用户管理</span>
    </el-menu-item>
    <el-menu-item index="posts" route="/admin/posts">
      <el-icon><ChatLineSquare /></el-icon>
      <span>帖子管理</span>
    </el-menu-item>
    <el-menu-item index="postFiles" route="/admin/postFiles">
      <el-icon><DocumentChecked /></el-icon>
      <span>投稿审核</span>
    </el-menu-item>
    <el-menu-item index="events" route="/admin/events">
      <el-icon><Aim /></el-icon>
      <span>活动管理</span>
    </el-menu-item>
    <el-menu-item index="badges" route="/admin/badges">
      <el-icon><Medal /></el-icon>
      <span>牌子发放</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { useRoute } from "vue-router";
import { Odometer, Bell, User, ChatLineSquare, DocumentChecked, Postcard, Aim, Medal } from "@element-plus/icons-vue"

const route = useRoute();
</script>

<style scoped>
@media (max-width: 992px) {
  .admin-menu .el-menu-item span{
    display: none;
  }
  .admin-menu .el-menu-item {
    display: flex;
    justify-content: center;
    align-items: center;
    .el-icon{
      margin: 0;
    }
  }
}
@media (max-width: 768px) {
  .admin-menu .el-menu-item{
    padding: 0 !important;
  }
}
</style>