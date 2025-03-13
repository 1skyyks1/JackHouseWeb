<template>
  <div>
    <navMenu></navMenu>
    <el-row justify="center">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-carousel :interval="4000" type="card" height="180px"></el-carousel>
      </el-col>
    </el-row>
    <el-row justify="center" :gutter="10">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-row :gutter="10">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" style="margin-bottom: 10px">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span style="display: flex; align-items: center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bell" viewBox="0 0 16 16">
                      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
                    </svg>
                    <span style="margin-left: 5px">公告</span>
                  </span>
                </div>
              </template>
              <div>
                <el-carousel height="150px" direction="vertical" :autoplay="true" :interval="4000">
                  <el-carousel-item v-for="(notice, index) in notices" :key="index">
                    <div>
                      <div class="notice-title">{{ notice.title }}</div>
                      <div class="notice-content">{{ notice.content }}</div>
                    </div>
                  </el-carousel-item>
                </el-carousel>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" style="margin-bottom: 10px">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span style="display: flex; align-items: center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-left-text" viewBox="0 0 16 16">
                      <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                      <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"/>
                    </svg>
                    <span style="margin-left: 5px">论坛</span>
                  </span>
                </div>
              </template>
              <div>
                <div v-for="(post, index) in posts" :key="index" class="post-item">
                  <div class="post-title">{{ post.title }}</div>
                  <div class="post-info">
                    <span class="post-username">发帖人：{{ post.username }}</span>
                    <span class="post-time">{{ post.created_time }}</span>
                  </div>
                  <el-divider />
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
      <el-col :xs="24" :sm="24" :md="24" :lg="4" :xl="4">
        <el-card style="height: 200px"></el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import navMenu from '../components/navmenu.vue'
import { ref } from "vue";

const notices = ref([
  { title: '公告 1', content: '这是公告 1 的详细内容。' },
  { title: '公告 2', content: '这是公告 2 的详细内容。' },
  { title: '公告 3', content: '这是公告 3 的详细内容。' }
])

const posts = ref([
  { title: '这是标题111', username: 'yks1', created_time: '2025-02-16 10:00' },
  { title: '这是标题222222', username: '1sky', created_time: '2025-02-15 14:30' },
  { title: '标题333333', username: 'yks1sky', created_time: '2025-02-14 09:45' }
])


</script>


<style scoped>
.el-row {
  margin-bottom: 10px;
}
.el-row:last-child {
  margin-bottom: 0;
}
:deep(.el-card__header){
  padding: 10px 20px;
}
.notice-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}
.notice-content {
  font-size: 14px;
}
.post-item {
  padding: 5px 0 10px;
}
.post-item:last-child{
  padding: 5px 0 0;
}
.post-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}
.post-info {
  font-size: 14px;
  display: flex;
  justify-content: space-between;
}
.post-username {
  margin-right: 15px;
}
:deep(.el-divider--horizontal){
  margin: 15px 0 5px;
}
</style>