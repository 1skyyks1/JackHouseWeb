<template>
  <div>
    <navMenu></navMenu>
    <el-row justify="center" :gutter="4" style="margin-bottom: 10px">
      <el-col :xs="18" :sm="18" :md="12" :lg="12" :xl="12">
        <el-input v-model="searchKeyword"
                  :prefix-icon="Search"
                  class="search-input"
                  @input="handleSearchInput"
                  :placeholder="t('pack.searchPlaceholder')">
        </el-input>
      </el-col>
      <el-col :xs="3" :sm="3" :md="2" :lg="2" :xl="2">
        <el-button size="large" class="create-button" plain @click="showTags = !showTags">
          <el-icon v-if="!showTags"><ArrowDown /></el-icon>
          <el-icon v-else><ArrowUp /></el-icon>
          <span v-if="!isMobile">{{ t('pack.tags') }}</span>
        </el-button>
      </el-col>
      <el-col :xs="3" :sm="3" :md="2" :lg="2" :xl="2">
        <el-button size="large" class="create-button" plain @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          <span v-if="!isMobile">{{ t('pack.add') }}</span>
        </el-button>
      </el-col>
    </el-row>
    <el-row justify="center" style="margin-bottom: 10px" :gutter="10" v-show="showTags">
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
            <el-table-column prop="creator" :label="t('pack.creator')" align="center" v-if="!isMobile"></el-table-column>
            <el-table-column label="..." align="center" width="120px">
              <template #default="scope">
                <div class="icon">
                  <img alt="osu" src="../assets/pic/osu/osu.svg" @click="openOsuLink(scope.row.osu_bid)" width="26" height="26">
                  <el-icon size="24px" @click="openPackInfo(scope.row.pack_id)"><InfoFilled /></el-icon>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="newPackDialog" :title="t('pack.addDialogTitle')" width="400px">
      <el-scrollbar height="458px">
        <el-form label-position="top" label-width="auto" :model="packForm" :rules="rules" ref="formRef">
          <el-form-item :label="t('pack.title')" prop="title">
            <el-input v-model="packForm.title"></el-input>
          </el-form-item>
          <el-form-item :label="t('pack.creator')" prop="creator">
            <el-input v-model="packForm.creator"></el-input>
          </el-form-item>
          <el-form-item :label="t('pack.osuBID')" prop="osuBID">
            <el-input v-model="packForm.osuBID" style="width: 200px"></el-input>
            <LinkPreview :url="getOsuLink(packForm.osuBID)" class="font-bold ml-4 cursor-pointer">
              <el-icon><Pointer /></el-icon>
              check
            </LinkPreview>
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

    <el-drawer v-model="drawerOpen" :title="t('pack.drawer.drawerTitle')" :size="getDrawerWidth">
      <el-descriptions :column="1">
        <el-descriptions-item :label="t('pack.drawer.title')">
          {{ drawerData.title }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('pack.drawer.creator')">
          {{ drawerData.creator }}
        </el-descriptions-item>
        <el-descriptions-item>
          <div class="tag-box">
            <el-check-tag v-for="tag in drawerData.tags" disabled>{{ tag.tag_name }}</el-check-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="t('pack.drawer.intro')">
          {{ drawerData.intro }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('pack.drawer.osuLink')">
          <el-button @click="openOsuLink(drawerData.osu_bid)">
            <img alt="osu" src="../assets/pic/osu/osu.svg" width="26" height="26">
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item :label="t('pack.drawer.url')" v-if="drawerData.other_url">
          <el-button @click="openLink(drawerData.other_url)">
            <el-icon size="24px"><Download /></el-icon>
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item :label="t('pack.drawer.added')">
          <el-button @click="enterUserPage(drawerData.user.user_id)">
            <img alt="avatar" :src="drawerData.user.avatar" width="26" height="26" style="margin-right: 8px">
            {{ drawerData.user.user_name }}
          </el-button>
        </el-descriptions-item>
      </el-descriptions>
      <el-card shadow="never" style="margin-top: 8px">
        <div class="comments">
          <div class="comment-form">
            <el-input
                type="textarea"
                :rows="2"
                v-model="newComment"
                :placeholder="t('pack.drawer.com.placeholder')"
            ></el-input>
            <div style="display: flex; justify-content: right">
              <el-button type="success" plain size="small" style="margin-top: 10px;" @click="createComment">{{ t('pack.drawer.com.createComment') }}</el-button>
            </div>
          </div>
          <el-divider class="comment-divider"></el-divider>
          <div class="comment-list">
            <div v-for="comment in comments" :key="comment.id">
              <div class="comment-item">
                <div class="comment-user">
                  <el-avatar shape="square" :src="comment.avatar"></el-avatar>
                  <span>{{ comment.user_name }}</span>
                  <el-divider direction="vertical" style="height: 100%"/>
                </div>
                <div class="comment-content">{{ comment.content }}</div>
                <div class="bottom">
                  <el-button text class="delete" v-if="String(comment.user_id) === String(userId)" @click="deletePackComment(comment.comment_id)">{{ t('pack.drawer.com.deleteComment') }}</el-button>
                  <div class="comment-time">{{ formatDate(comment.created_time) }}</div>
                </div>
              </div>
              <el-divider class="comment-divider"></el-divider>
            </div>
          </div>
          <el-pagination
              style="margin-top: 20px; justify-content: center"
              background
              layout="prev, pager, next"
              :page-size="commentPageSize"
              :total="totalComments"
              @current-change="handlePageChange"
          ></el-pagination>
        </div>
      </el-card>
    </el-drawer>
  </div>
</template>

<script setup>
import navMenu from "../components/navmenu.vue";
import { Plus, Search, RefreshLeft, Link, Pointer, InfoFilled, Download, ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import { onBeforeMount, ref, reactive, computed } from "vue";
import { useI18n } from 'vue-i18n';
import { packList, packCreate, packById } from "@/api/pack"
import { tagList } from "@/api/tag"
import { debounce } from "lodash";
import { dayjs, ElMessage } from "element-plus";
import LinkPreview from "@/components/ui/LinkPreview.vue";
import { useBreakpoints } from '@vueuse/core';
import router from "@/router/index.js";
import { packCommentCreate, packCommentList, packCommentDelete } from "@/api/packComment.js";
import { useStore } from "vuex";

const { t } = useI18n();
const store = useStore()

const userId = computed(() => store.state.userId);
const searchKeyword = ref('');
const page = ref(1);
const pageSize = ref(10);
const tags = ref([]);
const addPackTags = ref([])
const packs = ref([]);
const tableLoading = ref(false)
const newPackDialog = ref(false)
const showTags = ref(false)
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
const formRef = ref(null);
const drawerOpen = ref(false);
const drawerData = ref({});

const newComment = ref('')
const comments = ref([])
const commentPageSize = ref(3)
const commentPage = ref(1)
const totalComments = ref(0)
const commentLoading = ref(false)

const breakpoints = useBreakpoints({
  tablet: 768,
  laptop: 992,
  desktop: 1200,
});

const isMobile = breakpoints.smaller('tablet');
const isTablet = breakpoints.between('tablet', 'laptop');

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
  debouncedSearch();
  ElMessage.success(t('pack.refreshSuccess'))
}

const resetForm = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
}

const openCreateDialog = () => {
  resetForm();
  addPackTags.value.forEach((tag) => {
    tag.checked = false;
  })
  newPackDialog.value = true;
}

const submitPack = async () => {
  console.log(formRef.value);
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    packForm.tags = getCheckedTagIds(addPackTags.value);
    await packCreate(packForm);
    ElMessage.success(t('pack.submitSuccess'));
    newPackDialog.value = false;
    resetForm();
    getPackList();
  } catch (error) {
    console.log('Validation failed!', error);
  }
}

function getOsuLink(osuBID){
  return `https://osu.ppy.sh/beatmapsets/${osuBID}`
}

function openOsuLink(osuBID) {
  if (osuBID) {
    const url = getOsuLink(osuBID);
    window.open(url, '_blank');
  }
}

const enterUserPage = (userId) => {
  router.push({ path: `/user/${userId}` })
}

function openLink(url) {
  if (url) {
    window.open(url, '_blank');
  }
}

const openPackInfo = async (packId) => {
  try {
    await getPackInfo(packId);
    drawerOpen.value = true;
  } catch (error) {}
}

const getPackInfo = async (packId) => {
  const res = await packById(packId);
  drawerData.value = JSON.parse(JSON.stringify(res.data));
  await getCommentsByPackId()
}

const getDrawerWidth = computed(() => {
  if(isMobile.value){
    return '80%';
  }
  if(isTablet.value){
    return '50%'
  }
  else return '40%'
})

const getCommentsByPackId = async () => {
  commentLoading.value = true
  try {
    const res = await packCommentList(commentPage.value, commentPageSize.value, drawerData.value.pack_id)
    comments.value = res.data;
    totalComments.value = res.total;
    commentLoading.value = false;
  } catch (error) {
    commentLoading.value = false;
  }
}

const createComment = () => {
  if (!userId.value) {
    ElMessage.warning(t('pack.drawer.com.login'))
    store.commit('SET_LOGIN_DIALOG', true)
    return
  }
  let comment = {
    pack_id: drawerData.value.pack_id,
    content: newComment.value
  }
  packCommentCreate(comment).then(() => {
    ElMessage.success(t('pack.drawer.com.postSuccess'))
    newComment.value = ''
    getCommentsByPackId()
  })
}

const deletePackComment = (commentId) => {
  packCommentDelete(commentId).then(() => {
    ElMessage.success(t('pack.drawer.com.deleteCommentSuccess'))
    getCommentsByPackId()
  })
}

const handlePageChange = (page) => {
  commentPage.value = page;
  getCommentsByPackId();
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
.icon{
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  img, .el-icon{
    cursor: pointer;
    vertical-align: middle;
    &:hover{
      transform: scale(1.15);
      transition: all 0.2s ease-in-out;
    }
  }
}
.el-divider{
  margin-top: 8px;
}
.comment-divider{
  margin-bottom: 10px;
}
.comment-list {
  margin-top: 5px;
}
.comment-item {
  margin-bottom: 10px;
  padding: 5px;
  display: flex;
  position: relative;
}
.comment-user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
}
.comment-content {
  margin-left: 10px;
  font-size: 14px;
  overflow-wrap: break-word;
  word-break: break-word;
}
.comment-time {
  font-size: 12px;
  color: #999;
}
.bottom{
  position: absolute;
  right: 10px;
  bottom: 0;
  display: flex;
  justify-content: right;
  align-items: center;
}
.delete{
  font-size: 11px;
  margin: 1px 6px 0;
  padding: 0 6px;
}
</style>