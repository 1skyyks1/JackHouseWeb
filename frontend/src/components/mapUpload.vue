<template>
  <div class="container">
    <div class="upload-button">
      <el-upload
          class="upload"
          drag
          :auto-upload="false"
          :show-file-list="true"
          :limit="limit"
          :http-request="uploadFile"
          :on-change="selectFile"
          :on-remove="removeFile"
          ref="uploadRef"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          {{ t('mapUpload.dropText') }} <em>{{ t('mapUpload.clickText') }}</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            {{ t('mapUpload.tip') }}
          </div>
          <div class="el-upload__tip">
            {{ t('mapUpload.tip2') }}
          </div>
          <div class="el-upload__tip">
            {{ t('mapUpload.tip3') }}
          </div>
        </template>
      </el-upload>
    </div>
    <div>
      <el-button type="success" @click="submitUpload" :icon="Upload" :disabled="!selected" :loading="uploading">{{ t('mapUpload.upload') }}</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { postFileUpload } from "@/api/postFile";
import { Upload, UploadFilled } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const limit = ref(1)
const uploadRef = ref()
const selected = ref(false)
const uploading = ref(false)

const props = defineProps({
  postId: {
    type: Number,
    required: true,
  },
  userId: {
    type: Number,
    required: true,
  }
})

const selectFile = () => {
  selected.value = true
}

const removeFile = () => {
  selected.value = false
}

const uploadFile = async (file) => {
  if(!file.file){
    ElMessage.warning(t('mapUpload.warning'));
    return;
  }

  const formData = new FormData();
  formData.append('file', file.file)
  formData.append('post_id', props.postId)
  formData.append('user_id', props.userId)

  uploading.value = true

  return await postFileUpload(formData).then(() => {
    ElMessage.success(t('mapUpload.success'));
    uploading.value = false
  }).catch(err => {
    console.log(err)
    uploading.value = false
  })
}

const submitUpload = () => {
  uploadRef.value.submit()
}

</script>

<style scoped>
.upload-button{
  margin-bottom: 10px;
}
</style>