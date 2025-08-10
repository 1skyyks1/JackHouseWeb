<template>
  <el-card shadow="never" class="main-card">
    <template #header>
      <span>仪表盘</span>
    </template>
    <div>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-card shadow="never">
            <el-statistic :title="t('home.dashboard.user')" :value="userValue" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never">
            <el-statistic :title="t('home.dashboard.post')" :value="postValue" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never">
            <el-countdown :format="countdownFormat" :value="fourthAnni">
              <template #title>
                <div style="display: inline-flex; align-items: center">
                  {{ t('home.dashboard.anni') }}
                </div>
              </template>
            </el-countdown>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script setup>
import { homeDashboard } from "@/api/dashboard"
import { ref, onBeforeMount, computed } from "vue";
import { useTransition } from "@vueuse/core";
import { dayjs } from "element-plus";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const userCount = ref(0)
const postCount = ref(0)

const userValue = useTransition(userCount, {
  duration: 1500,
})
const postValue = useTransition(postCount, {
  duration: 1500,
})

const fourthAnni = ref(dayjs('2026-06-01 00:00:00').valueOf());

const countdownFormat = computed(() => {
  return `DD [${t('home.dashboard.day')}] HH:mm:ss`
})

const getHomeDashboard = () => {
  homeDashboard().then(response => {
    userCount.value = response.userCount;
    postCount.value = response.postCount;
  })
}

onBeforeMount(() => {
  getHomeDashboard();
})
</script>

<style scoped>
.main-card{
  height: calc(100vh - 80px);
}
</style>