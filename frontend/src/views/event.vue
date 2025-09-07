<template>
  <div>
    <navMenu></navMenu>
    <el-row justify="center">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-card v-loading="eventLoading" shadow="never" style="margin-bottom: 10px;">
          <el-tabs v-model="activeTab" @tab-change="handleChange">
            <el-tab-pane :name="-2">
              <template #label>
                <span class="custom-tabs-label">
                  <el-icon><LocationInformation /></el-icon>
                <span>{{ t('event.overview') }}</span>
                </span>
              </template>
              <template #default>
                <div class="event-header">
                  <span class="event-name">{{ event.name }}</span>
                  <span class="event-time">
                    {{ noYearDate(event.start) }} ~ {{ noYearDate(event.end) }}
                  </span>
                </div>
                <div class="event-header">
                  <el-countdown :format="countdownFormat" :value="dayjs(event.end)" value-style="font-size: 14px">
                    <template #prefix>
                      <div style="font-size: 14px">
                        {{ t('event.countdown') }}
                      </div>
                    </template>
                  </el-countdown>
                </div>
                <el-divider class="custom-divider"></el-divider>
                <div>
                  <div class="score-header">
                    <div class="my-score">{{ t('event.myScore') }}</div>
                    <el-button style="margin-top: 14px" plain type="success" @click="createScore" :disabled="createDisabled" :loading="createLoading">
                      {{ createDisabled ? `${t('event.submitScore')} (${countdown}s)` : t('event.submitScore') }}
                    </el-button>
                  </div>
                  <div v-if="totalScore.totalRank" class="total-score">{{ t('event.totalRank') }}: #{{ totalScore.totalRank }} / {{ t('event.totalScore') }}: {{ totalScore.totalScore }}</div>
                  <div v-else class="no-score">{{ t('event.noScore') }}</div>
                </div>
                <el-row justify="center" class="stage-list" :gutter="8">
                  <el-col v-for="(stage, index) in stages" :key="stage.id" :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                    <div class="stage-card" @click="goToOsu(stage.map_id)">
                      <div class="stage-bg" :style="{ backgroundImage: `url(${stage.url})` }"></div>
                      <div class="stage-overlay"></div>
                      <div class="stage-info">
                        <div>
                          <div class="stage-title">{{ stage.artist }} - {{ stage.title }}</div>
                          <div class="stage-mapper">Mapped by {{ stage.mapper }}</div>
                        </div>
                        <div>
                          <div class="stage-title">#{{ stageScores && stageScores[index]?.rank || '' }}</div>
                          <div class="stage-mapper">{{ stageScores && stageScores[index]?.score || t('event.noScore') }}</div>
                        </div>
                      </div>
                    </div>
                  </el-col>
                </el-row>
                <el-divider class="custom-divider"></el-divider>
                <div class="score-header">
                  <div class="desc-title">{{ t('event.rule') }}</div>
                </div>
                <div class="event-rules">
                  <p class="rule">{{ t('event.rule1') }}</p>
                  <p class="rule">{{ t('event.rule2') }}</p>
                  <p class="rule">{{ t('event.rule3') }}</p>
                  <p class="rule">{{ t('event.rule4') }}</p>
                  <p class="rule">{{ t('event.rule5') }}</p>
                </div>
                <el-divider class="custom-divider"></el-divider>
                <div class="score-header">
                  <div class="desc-title">{{ t('event.desc') }}</div>
                </div>
                <div class="prose max-w-none dark:prose-invert mt-3" v-html="event.desc"></div>
              </template>
            </el-tab-pane>
            <el-tab-pane :name="-1">
              <template #label>
                <span class="custom-tabs-label">
                  <el-icon><Trophy /></el-icon>
                  <span>{{ t('event.leaderboard') }}</span>
                </span>
              </template>
              <template #default>
                <div class="rank">
                  <el-table :data="eventRank" style="width: 100%" :row-class-name="tableRowClassName" class="total-table">
                    <el-table-column type="index" align="center" :index="indexMethod" min-width="40">
                      <template #default="{ row, $index }">
                        <span v-if="indexMethod($index) === 1" style="font-size: 26px">🥇</span>
                        <span v-else-if="indexMethod($index) === 2" style="font-size: 24px">🥈</span>
                        <span v-else-if="indexMethod($index) === 3" style="font-size: 24px">🥉</span>
                        <span v-else>#{{ indexMethod($index) }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column align="right" min-width="70" class="avatar-col">
                      <template v-slot:default="scope">
                        <el-avatar shape="square" :src="scope.row.user.avatar" style="margin-top: 5px"/>
                      </template>
                    </el-table-column>
                    <el-table-column :label="t('event.username')" align="left" min-width="120" class="name-col">
                      <template v-slot:default="scope">
                        <span>{{ scope.row.user.user_name }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="totalScore" min-width="100" :label="t('event.totalScore')" align="center"></el-table-column>
                  </el-table>
                  <el-pagination
                      style="margin-top: 14px; justify-content: center"
                      size="small"
                      hide-on-single-page
                      background
                      layout="prev, pager, next"
                      :page-size="pageSize"
                      :total="totalRank"
                      @current-change="handleTotalRankPageChange"
                  ></el-pagination>
                </div>
              </template>
            </el-tab-pane>
            <el-tab-pane v-for="(stage, index) in stages" :name="index" :label="'Stage ' + (index + 1)">
              <div class="stage-card" @click="goToOsu(stage.map_id)">
                <div class="stage-bg" :style="{ backgroundImage: `url(${stage.url})` }"></div>
                <div class="stage-overlay"></div>
                <div class="stage-info">
                  <div>
                    <div class="stage-title">{{ stage.artist }} - {{ stage.title }}</div>
                    <div class="stage-mapper">Mapped by {{ stage.mapper }}</div>
                  </div>
                </div>
              </div>
              <el-table :data="stageRank" style="width: 100%" :row-class-name="tableRowClassName">
                <el-table-column type="index" align="center" :index="indexMethod" min-width="40">
                  <template #default="{ row, $index }">
                    <span>#{{ indexMethod($index) }}</span>
                  </template>
                </el-table-column>
                <el-table-column align="right" min-width="70" class="avatar-col">
                  <template v-slot:default="scope">
                    <el-avatar shape="square" :src="scope.row.user.avatar" style="margin-top: 5px"/>
                  </template>
                </el-table-column>
                <el-table-column :label="t('event.username')" align="left" min-width="120" class="name-col">
                  <template v-slot:default="scope">
                    <span>{{ scope.row.user.user_name }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="score" min-width="100" :label="t('event.score')" align="center"></el-table-column>
              </el-table>
              <el-pagination
                  style="margin-top: 14px; justify-content: center"
                  size="small"
                  hide-on-single-page
                  background
                  layout="prev, pager, next"
                  :page-size="pageSize"
                  :total="totalRank"
                  @current-change="handleStageRankPageChange"
              ></el-pagination>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { dayjs, ElMessage } from "element-plus";
import navMenu from "@/components/navmenu.vue";
import { computed, onBeforeMount, reactive, ref } from "vue";
import { useI18n } from 'vue-i18n';
import { useStore } from "vuex"
import { LocationInformation, QuestionFilled, Trophy } from '@element-plus/icons-vue'
import { eventStages, userScore, stageScore, eventScore, scoreCreate } from '@/api/event.js'

const route = useRoute();
const { t } = useI18n();
const store = useStore()

const userId = computed(() => store.state.userId);
const event_id = route.params.event_id;
const eventLoading = ref(false);
const createLoading = ref(false);
const createDisabled = ref(false);
const countdown = ref(90)
let timer = null
const stages = ref([])
const event = ref({})
const stageScores = ref([])
const totalScore = ref({})
const activeTab = ref(-2)

const page = ref(1)
const pageSize = ref(8)
const totalRank = ref(0)
const stageRank = ref([])
const eventRank = ref([])

const noYearDate = (dateString) => {
  return dayjs(dateString).format('MM-DD HH:mm');
}

const countdownFormat = computed(() => {
  return `DD [${t('home.dashboard.day')}] HH:mm:ss`
})

const indexMethod = (index) => {
  return (page.value - 1) * pageSize.value + index + 1;
};

const handleTotalRankPageChange = (newPage) => {
  page.value = newPage;
  getEventScore();
}

const handleStageRankPageChange = (newPage) => {
  page.value = newPage;
  getStageScore(stages.value[activeTab.value].id);
}

const goToOsu = (bid) => {
  window.open('https://osu.ppy.sh/b/' + bid)
}

const tableRowClassName = ({ row, rowIndex }) => {
  const rank = indexMethod(rowIndex)
  if (rank === 1) {
    return 'first-row'
  } else if (rank === 2) {
    return 'second-row'
  } else if (rank === 3) {
    return 'third-row'
  }
  return ''
}

const getStages = () => {
  eventLoading.value = true;
  eventStages(event_id).then(response => {
    stages.value = response.data;
    event.value = response.event;
    eventLoading.value = false;
  }).catch(() => {
    eventLoading.value = false;
  })
}

const getUserScore = () => {
  if(userId){
    userScore(event_id).then(response => {
      stageScores.value = response.data;
      totalScore.value = response.total;
    })
  }
}

const getStageScore = (id) => {
  stageScore(page.value, pageSize.value, id).then(response => {
    stageRank.value = response.data;
    totalRank.value = response.total;
  })
}

const getEventScore = () => {
  eventScore(page.value, pageSize.value, event_id).then(response => {
    eventRank.value = response.data;
    totalRank.value = response.total;
  })
}

const createScore = () => {
  if(createLoading.value || createDisabled.value) return;
  createLoading.value = true;
  createDisabled.value = true;
  countdown.value = 90
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      createDisabled.value = false
    }
  }, 1000)
  scoreCreate(event_id).then(() => {
    getUserScore();
    ElMessage.success(t('event.createSuccess'));
  }).catch(() => {}).finally(() => {
    createLoading.value = false;
  })
}

const handleChange = (name) => {
  const n = Number(name);
  if(Number(n) === -2){
    getStages();
    getUserScore();
  }
  else if(Number(n) === -1){
    getEventScore();
  }
  else{
    getStageScore(stages.value[n].id);
  }
}

onBeforeMount(() => {
  getStages();
  getUserScore();
})
</script>

<style scoped>
.custom-tabs-label .el-icon {
  vertical-align: middle;
}
.custom-tabs-label span {
  vertical-align: middle;
  margin-left: 4px;
}
.el-card :deep(.el-card__body) {
  padding: 5px 20px 20px;
}
.event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.event-name {
  font-size: 22px;
  font-weight: bold;
}
.event-time {
  font-size: 13px;
}
.score-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.no-score {
  font-size: 14px;
  font-style: italic;
  margin-top: 10px;
}
.my-score {
  font-size: 18px;
  margin-top: 10px;
  font-weight: bold;
}
.total-score {
  font-size: 14px;
}
.stage-list {
  margin-top: 10px;
}
.stage-card {
  position: relative;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
  color: #fff;
  cursor: pointer;
  &:hover .stage-bg {
    transform: scale(1.02);
    transition: linear 0.1s;
  }
}
.stage-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: 0;
}
.stage-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right,  rgba(0,0,0,0.9), rgba(0,0,0,0.3), rgba(0,0,0,0.9));
  z-index: 1;
}
.stage-info {
  position: relative;
  z-index: 1;
  padding: 16px;
  display: flex;
  justify-content: space-between;
}
.stage-title {
  font-size: 16px;
  text-align: right;
}
.stage-mapper {
  font-size: 12px;
}
:deep(.custom-divider.el-divider--horizontal){
  margin: 10px 0 5px;
}
.user {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 6px;
}
.desc-title {
  margin-top: 14px;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}
.rule {
  margin-bottom: 4px;
}
.rule:last-child {
  margin-bottom: 16px;
}

.el-table :deep(.first-row) {
  font-weight: bold;
}

.el-table :deep(.second-row) {
  font-weight: bold;
}

.el-table :deep(.third-row) {
  font-weight: bold;
}
.total-table :deep(.el-table__body td:nth-child(1) .cell) {
  padding: 0 !important;
}
.el-table :deep(.el-table__body td:nth-child(2) .cell) {
  padding: 0 12px !important;
}
.el-table :deep(.el-table__body td:nth-child(3) .cell) {
  padding: 0 !important;
}
</style>