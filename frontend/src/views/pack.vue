<template>
  <div>
    <navMenu></navMenu>
    <el-row justify="center" :gutter="10" style="margin-bottom: 10px">
      <el-col :xs="18" :sm="20" :md="12" :lg="14" :xl="14">
        <el-input v-model="searchKeyword"
                  :prefix-icon="Search"
                  class="search-input"
                  @input="handleSearchInput"
                  :placeholder="t('pack.searchPlaceholder')">
        </el-input>
      </el-col>
      <el-col :xs="6" :sm="4" :md="4" :lg="2" :xl="2">
        <el-button size="large" class="create-button" plain @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          <span>{{ t('pack.add') }}</span>
        </el-button>
      </el-col>
    </el-row>
    <el-row justify="center" style="margin-bottom: 10px" :gutter="10">
      <el-col :xs="24" :sm="24" :md="12" :lg="14" :xl="14">
        <el-card shadow="never" class="tag-card">
          <div class="tag-box">
            <p>{{ t('pack.pattern') }}</p>
            <el-check-tag v-for="tag in tags.slice(0, 7)" v-model:checked="tag.checked" @change="handleTagSelect">{{ tag.tag_name }}</el-check-tag>
          </div>
          <div class="tag-box">
            <p>{{ t('pack.bpm') }}</p>
            <el-check-tag v-for="tag in tags.slice(7, 19)" v-model:checked="tag.checked" @change="handleTagSelect">{{ tag.tag_name }}</el-check-tag>
          </div>
          <div class="tag-box">
            <p>{{ t('pack.difficulty') }}</p>
            <el-check-tag v-for="tag in tags.slice(19)" v-model:checked="tag.checked" @change="handleTagSelect">{{ tag.tag_name }}</el-check-tag>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="4" :lg="2" :xl="2">
        <el-button size="large" class="refresh-button" plain @click="refreshTags">
          <el-icon><RefreshLeft /></el-icon>
          <span>{{ t('pack.refresh') }}</span>
        </el-button>
      </el-col>
    </el-row>
    <el-row justify="center">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-card shadow="never">
          <el-table :data="packs" class="pack-table" v-loading="tableLoading">
            <el-table-column prop="title" :label="t('pack.title')" align="center"></el-table-column>
            <el-table-column prop="creator" :label="t('pack.creator')" align="center"></el-table-column>
            <el-table-column label="..." align="center">

            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="newPackDialog" :title="t('pack.addDialogTitle')" width="400px">
      <el-scrollbar height="458px">
        <el-form label-position="top" label-width="auto" :model="packForm" :rules="rules">
          <el-form-item :label="t('pack.title')" prop="title">
            <el-input v-model="packForm.title"></el-input>
          </el-form-item>
          <el-form-item :label="t('pack.creator')" prop="creator">
            <el-input v-model="packForm.creator" ></el-input>
          </el-form-item>
          <el-form-item :label="t('pack.osuBID')" prop="osuBID">
            <el-input v-model="packForm.osuBID"></el-input>
          </el-form-item>
          <el-collapse>
            <el-collapse-item :title="t('pack.tags')">
              <div class="tag-box">
                <p>{{ t('pack.pattern') }}</p>
                <el-check-tag v-for="tag in addPackTags.slice(0, 7)" v-model:checked="tag.checked">{{ tag.tag_name }}</el-check-tag>
              </div>
              <div class="tag-box">
                <p>{{ t('pack.bpm') }}</p>
                <el-check-tag v-for="tag in addPackTags.slice(7, 19)" v-model:checked="tag.checked">{{ tag.tag_name }}</el-check-tag>
              </div>
              <div class="tag-box">
                <p>{{ t('pack.difficulty') }}</p>
                <el-check-tag v-for="tag in addPackTags.slice(19)" v-model:checked="tag.checked">{{ tag.tag_name }}</el-check-tag>
              </div>
            </el-collapse-item>
          </el-collapse>
          <el-form-item :label="t('pack.url')">
            <el-input v-model="packForm.url" :prefix-icon="Link"></el-input>
          </el-form-item>
          <el-form-item :label="t('pack.intro')">
            <el-input v-model="packForm.intro" type="textarea" autosize></el-input>
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <div>
          <el-button @click="newPackDialog = false">{{ t('pack.cancel') }}</el-button>
          <el-button type="primary" @click="submitPack">
            {{ t('pack.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import navMenu from "../components/navmenu.vue";
import { Plus, Search, RefreshLeft, Link } from "@element-plus/icons-vue";
import { onBeforeMount, ref, reactive } from "vue";
import { useI18n } from 'vue-i18n';
import { packList, packCreate, packById } from "@/api/pack"
import { tagList } from "@/api/tag"
import { debounce } from "lodash";
import { dayjs, ElMessage } from "element-plus";

const { t } = useI18n();

const searchKeyword = ref('');
const page = ref(1);
const pageSize = ref(10);
const tags = ref([]);
const addPackTags = ref([])
const packs = ref([]);
const tableLoading = ref(false)
const newPackDialog = ref(false)
const packForm = reactive({
  title: '',
  creator: '',
  osuBID: '',
  url: '',
  tags: [],
  intro: '',
})
const rules = {
  title: [{ required: true, message: t('pack.validate.title'), trigger: "blur" }],
  creator: [{ required: true, message: t('pack.validate.creator'), trigger: "blur" }],
  osuBID: [{ required: true, message: t('pack.validate.osuBID'), trigger: "blur" }],
}

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD');
}

const getPackList = () => {
  tableLoading.value = true;
  packList(page.value, pageSize.value, searchKeyword.value, getCheckedTagIds(tags.value)).then((res) => {
    packs.value = res.data;
    tableLoading.value = false;
  }).catch(err => {
    ElMessage.error(err)
    tableLoading.value = false;
  })
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
    tags.value = JSON.parse(JSON.stringify(tagData));
    addPackTags.value = JSON.parse(JSON.stringify(tagData));
  })
}

const debouncedSearch = debounce(() => {
  page.value = 1;
  getPackList();
}, 1000);

const handleTagSelect = () => {
  debouncedSearch();
}

const handleSearchInput = () => {
  debouncedSearch();
}

const refreshTags = () => {
  tags.value.forEach((tag) => {
    tag.checked = false;
  })
  ElMessage.success(t('pack.refreshSuccess'))
}

const resetForm = () => {
  packForm.title = ''
  packForm.creator = ''
  packForm.osuBID = ''
  packForm.url = ''
  packForm.tags = []
  packForm.intro = ''
}

const openCreateDialog = () => {
  resetForm();
  addPackTags.value.forEach((tag) => {
    tag.checked = false;
  })
  newPackDialog.value = true;
}

const submitPack = () => {
  packForm.tags = getCheckedTagIds(addPackTags.value);
  packCreate(packForm).then(() => {
    ElMessage.success(t('pack.submitSuccess'))
    newPackDialog.value = false;
    resetForm();
    getPackList();
  })
}

onBeforeMount(() => {
  getTagList();
  getPackList();
})
</script>


<style scoped>
:deep(.el-input .el-input__wrapper){
  height: 38px;
  border-radius: 7px;
  margin-top: 1px;
}
:deep(.el-input .el-input__inner){
  padding: 0 6px;
}
:deep(.el-input .el-input__suffix){
  padding-right: 6px;
}
.create-button{
  border-radius: 6px;
  width: 100%;
}
.refresh-button{
  border-radius: 6px;
  width: 100%;
  height: 100%;
}
.refresh-card :deep(.el-card__body){
  height: 100%;
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
.el-card :deep(.el-card__body){
  padding: 12px 12px !important;
}
.el-form{
  margin: 0 10px;
}
.el-form :deep(.el-form-item){
  margin-bottom: 14px;
}
.el-form :deep(.el-form-item__label){
  margin-bottom: 6px;
}
.el-collapse {
  margin-bottom: 10px;
}
.el-collapse :deep(.el-collapse-item__title){
  font-size: 14px;
}
</style>