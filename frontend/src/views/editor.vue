<template>
  <div>
    <navMenu></navMenu>
    <el-row justify="center">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-card shadow="never" style="margin-bottom: 10px">
          <template #header>
            <div class="card-header">
              <div class="post-header">
                <el-icon><EditPen /></el-icon>
                <span>{{ t('forum.editor.editor') }}</span>
              </div>
            </div>
          </template>
          <div v-if="newPost">
            <div style="margin-bottom: 8px">{{ t('forum.editor.postTypes') }}</div>
            <el-select v-model="postForm.type" :placeholder="t('forum.placeholder.selectPostType')" style="width: 50%">
              <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
            <el-divider></el-divider>
          </div>
          <div style="margin: 8px 0">{{ t('forum.editor.chineseTitle') }}</div>
          <el-input
              v-model="postForm.title_zh"
              placeholder="请输入标题"
              style="margin-bottom: 10px"></el-input>
          <div style="margin: 8px 0">{{ t('forum.editor.chineseContent') }}</div>
          <wangEditor v-model="postForm.content_zh"></wangEditor>
          <el-divider></el-divider>
          <div style="margin: 8px 0">{{ t('forum.editor.englishTitle') }}</div>
          <el-input
              v-model="postForm.title_en"
              placeholder="Please input the title"
              style="margin-bottom: 10px"></el-input>
          <div style="margin: 8px 0">{{ t('forum.editor.englishContent') }}</div>
          <wangEditor v-model="postForm.content_en"></wangEditor>
          <el-divider></el-divider>
          <div style="margin-top: 10px">
            <el-button type="primary" plain @click="submitForm">
              {{ newPost? t('forum.editor.create') : t('forum.editor.update') }}
            </el-button>
            <el-button plain @click="cancelForm">{{ t('forum.editor.cancel') }}</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount, reactive } from 'vue'
import router from "@/router";
import wangEditor from "@/components/wangEditor.vue";
import { postCreate, postById, postUpdate } from "@/api/post";
import navMenu from "@/components/navmenu.vue";
import { useStore } from "vuex";
import { userInfo } from "@/api/user.js";
import { useI18n } from "vue-i18n";
import { EditPen } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const store = useStore()
const { t } = useI18n();

const props = defineProps({
  id: String
})

const newPost = !props.id // 如果未传postId，为新帖子
const userId = computed(() => store.state.userId);
const role = ref(null);
const postForm = reactive({
  type: null,
  status: null,
  translations: [],
  title_zh: '',
  content_zh: '',
  title_en: '',
  content_en: '',
});

const roleTypeMap = {
  0: [0],       // USER
  1: [0, 1, 2], // ORG
  2: [0, 1, 2], // ADMIN
};

const allOptions = [
  {
    value: 0,
    label: t('forum.postType.normal'),
  },
  {
    value: 1,
    label: t('forum.postType.mapRequest'),
  },
  {
    value: 2,
    label: t('forum.postType.event'),
  },
];

const options = computed(() => {
  if (role.value === null) return [];
  const allowedTypes = roleTypeMap[role.value];
  return allOptions.filter(opt => allowedTypes.includes(opt.value));
});

const getUserInfo = async () => {
  const res = await userInfo();
  role.value = res.data.role;
}

const getPostInfo = () => {
  postById(props.id).then(response => {
    let dataForm = response.data
    const zhTranslation = dataForm.translations.find(t => t.language === 'zh');
    const enTranslation = dataForm.translations.find(t => t.language === 'en');
    dataForm.title_zh = zhTranslation ? zhTranslation.title : '';
    dataForm.content_zh = zhTranslation ? zhTranslation.content : '';
    dataForm.title_en = enTranslation ? enTranslation.title : '';
    dataForm.content_en = enTranslation ? enTranslation.content : '';
    Object.assign(postForm, dataForm)
  })
}

const submitForm = () => {
  if(postForm.type === null){
    ElMessage.warning(t('forum.selectType'))
    return
  }
  const form = {
    user_id : userId.value,
    type: postForm.type,
    status: postForm.status,
    translations: [
      {
        title: postForm.title_zh,
        content: postForm.content_zh,
        language: 'zh'
      },
      {
        title: postForm.title_en,
        content: postForm.content_en,
        language: 'en'
      }
    ]
  }
  if(newPost){
    postCreate(form).then(response => {
      ElMessage.success(t('forum.editor.createSuccess'))
      goToPage(response.data.post_id)
    })
  }
  else{
    postUpdate(props.id, form).then(() => {
      ElMessage.success(t('forum.editor.editSuccess'))
      goToPage(props.id)
    })
  }
}

const cancelForm = () => {
  if(newPost){
    router.push('/forum')
  }
  else{
    router.push('/post/' + props.id);
  }
}

const goToPage = (id) => {
  router.push('/post/' + id)
}

onBeforeMount(() => {
  getUserInfo()
  if(!newPost){
    getPostInfo()
  }
})

</script>

<style scoped>
:deep(.el-card .el-card__header){
  padding: 1vh 15px;
}
.card-header{
  display: flex;
  justify-content: space-between;
}
.post-header{
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>