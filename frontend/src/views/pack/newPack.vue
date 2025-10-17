<template>
  <div>
    <navMenu></navMenu>
    <el-row justify="center">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <div class="new-pack-header">
                <el-icon><Plus /></el-icon>
                <span>{{ t('pack.newPack.title') }}</span>
              </div>
            </div>
          </template>
          <div>
            <el-form label-position="top" label-width="auto" :model="packForm" :rules="rules" ref="formRef">
              <el-form-item :label="t('pack.newPack.osuBID')" prop="osuBID">
                <el-input v-model="packForm.osuBID" style="width: 200px" :disabled="lockOsuBID" class="osu-bid-input"></el-input>
                <el-button @click="getOsuPackInfo" type="warning" plain :loading="checkLoading" :disabled="allowSubmit">{{ t('pack.newPack.check') }}</el-button>
              </el-form-item>
              <el-row justify="center" class="stage-list">
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                  <div class="stage-card" @click="goToOsu(packForm.osuBID)">
                    <div class="stage-bg" :style="{ backgroundImage: `url(${newPackInfo.cover})` }"></div>
                    <div class="stage-overlay"></div>
                    <div class="stage-info">
                      <div>
                        <div class="stage-title">{{ newPackInfo.artist }} - {{ newPackInfo.title }}</div>
                        <div class="stage-mapper">Created by {{ newPackInfo.creator }}</div>
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>
              <el-form-item :label="t('pack.newPack.type')" prop="type">
                <div style="width: 240px; display: flex; align-items: center; gap: 10px">
                  <el-select v-model="packForm.type">
                    <el-option :value="0" :label="t('pack.practice')" :key="0"></el-option>
                    <el-option :value="1" :label="t('pack.collection')" :key="1"></el-option>
                    <el-option :value="2" :label="t('pack.dan')" :key="2"></el-option>
                    <el-option :value="3" :label="t('pack.single')" :key="3"></el-option>
                  </el-select>
                  <el-popover placement="bottom-end" :content="t('pack.typePopover')">
                    <template #reference>
                      <el-icon><QuestionFilled /></el-icon>
                    </template>
                  </el-popover>
                </div>
              </el-form-item>
              <el-collapse v-if="packForm.type !== 1">
                <el-collapse-item :title="t('pack.newPack.tags')">
                  <div class="tag-box" v-if="packForm.type === 0 || packForm.type === 3">
                    <p>{{ t('pack.pattern') }}</p>
                    <el-check-tag v-for="tag in addPackTags.slice(0, 7)" v-model:checked="tag.checked">
                      {{ t(`tags.${tag.tag_name}`) }}
                    </el-check-tag>
                  </div>
                  <div class="tag-box" v-if="packForm.type === 0">
                    <p>{{ t('pack.bpm') }}</p>
                    <el-check-tag v-for="tag in addPackTags.slice(7, 19)" v-model:checked="tag.checked">{{ tag.tag_name }}</el-check-tag>
                  </div>
                  <div class="tag-box" v-if="packForm.type === 0 || packForm.type === 2">
                    <p>{{ t('pack.difficulty') }}</p>
                    <el-check-tag v-for="tag in addPackTags.slice(19)" v-model:checked="tag.checked">{{ tag.tag_name }}</el-check-tag>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </el-form>
            <div class="end-button">
              <el-button @click="resetNewPack" class="reset-button">
                <el-icon><RefreshRight /></el-icon>
                <span>{{ t('pack.newPack.reset') }}</span>
              </el-button>
              <el-button type="primary" @click="submitPack" :disabled="!allowSubmit">
                {{ t('pack.confirm') }}
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import navMenu from "@/components/navmenu.vue";
import { QuestionFilled, Plus, RefreshRight } from "@element-plus/icons-vue";
import { onBeforeMount, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { packFromOsu, packDetailFromOsu } from "@/api/pack.js"
import { ElMessage } from "element-plus";
import { tagList } from "@/api/tag.js";

const { t } = useI18n();

const packForm = reactive({
  osuBID: null,
  tags: [],
  type: null
})
const newPackInfo = reactive({
  artist: '',
  creator: '',
  title: '',
  cover: '',
})
const addPackTags = ref([])
const allowSubmit = ref(false);
const lockOsuBID = ref(false);
const checkLoading = ref(false);

const rules = {
  osuBID: [{ required: true, message: t('pack.validate.osuBID'), trigger: "blur" }],
  type: [{ required: true, message: t('pack.validate.type'), trigger: "blur" }],
}
const formRef = ref(null);

const getOsuPackInfo = () => {
  lockOsuBID.value = true;
  checkLoading.value = true;
  if(!packForm.osuBID) {
    ElMessage.error(t("pack.newPack.checkError"));
    allowSubmit.value = false;
    lockOsuBID.value = false;
    checkLoading.value = false;
  }
  else {
    packDetailFromOsu(packForm.osuBID).then(response => {
      Object.assign(newPackInfo, response);
      allowSubmit.value = true;
    }).catch(() => {
      resetNewPack();
    }).finally(() => {
      checkLoading.value = false;
    })
  }
}

const goToOsu = (bid) => {
  window.open('https://osu.ppy.sh/beatmapsets/' + bid)
}

function getCheckedTagIds(tagsArray) {
  return tagsArray.filter(tag => tag.checked).map(tag => tag.tag_id);
}

const getTagList = () => {
  tagList().then((res) => {
    const tagData = res.data;
    tagData.forEach(tag => {
      tag.checked = false;
    });
    addPackTags.value = JSON.parse(JSON.stringify(tagData));
  })
}

const resetForm = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
}

const refreshTags = () => {
  addPackTags.value.forEach((tag) => {
    tag.checked = false;
  })
}

const resetNewPackInfo = () => {
  newPackInfo.artist = '';
  newPackInfo.creator = '';
  newPackInfo.title = '';
  newPackInfo.cover = '';
};

const resetNewPack = () => {
  resetForm();
  allowSubmit.value = false;
  lockOsuBID.value = false;
  checkLoading.value = false;
  refreshTags();
  resetNewPackInfo();
}

const submitPack = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    packForm.tags = getCheckedTagIds(addPackTags.value);
    await packFromOsu(packForm.osuBID, packForm);
    ElMessage.success(t('pack.submitSuccess'));
    resetNewPack();
  } catch (error) {

  }
}

onBeforeMount(() => {
  getTagList();
})
</script>

<style scoped>
:deep(.el-card .el-card__header){
  padding: 1.5vh 15px;
}
.card-header{
  display: flex;
  justify-content: space-between;
}
.new-pack-header{
  display: flex;
  align-items: center;
  gap: 6px;
}
.osu-bid-input{
  margin-right: 6px;
}
.el-form-item{
  margin-bottom: 24px;
}
.stage-list {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
}
.stage-card {
  position: relative;
  border-radius: 8px;
  margin-bottom: 8px;
  height: 82px;
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
  padding: 20px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.stage-info > div:first-child {
  flex: 1;
  min-width: 0;
}
.stage-title {
  font-size: 16px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}
.stage-mapper {
  font-size: 12px;
}
.el-collapse {
  margin-bottom: 10px;
}
.el-collapse :deep(.el-collapse-item__title){
  font-size: 14px;
}
.tag-box{
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-start;
  margin-bottom: 10px;
  &:last-child{
    margin-bottom: 0;
  }
}
.end-button{
  display: flex;
}
.reset-button{
  display: flex;
  align-items: center;
  gap: 2px;
}
</style>