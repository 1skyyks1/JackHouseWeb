<template>
  <div class="container">
    <div class="upload">
      <el-upload
          class="upload"
          drag
          multiple
          :auto-upload="false"
          :show-file-list="true"
          :http-request="uploadFile"
          :on-change="selectFile"
          :on-remove="removeFile"
          :limit="limit"
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
        </template>
      </el-upload>
    </div>
    <div class="upload-btn">
      <el-button type="success" @click="submitUpload" :icon="Upload" :disabled="!selected" :loading="uploading">{{ t('mapUpload.upload') }}</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { uploadUrl, postFileCreate } from "@/api/postFile";
import { Upload, UploadFilled } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n';
import { ElMessage } from "element-plus";

const { t } = useI18n();

const uploadRef = ref()
const selected = ref(false)
const uploading = ref(false)

const props = defineProps({
  postId: { type: Number, required: true },
  userId: { type: Number, required: true },
  limit: { type: Number, required: true },
})

const emit = defineEmits(['upload-success'])

const selectFile = (file, fileList) => {
  selected.value = fileList.length > 0
}

const removeFile = (file, fileList) => {
  selected.value = fileList.length > 0
}

const uploadFile = async (file) => {
  if(!file.file){
    ElMessage.warning(t('mapUpload.warning'));
    return;
  }
  uploading.value = true
  const url = await getUploadUrl();
  const formData = new FormData();
  formData.append('file', file.file);
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  const result = await response.json();
  console.log(file);
  await postFileCreate({
    post_id: props.postId,
    file_url: result.data,
    file_name: file.file.name,
    size: file.file.size
  }).then(() => {
    ElMessage.success(t('mapUpload.success'));
    uploading.value = false;
    uploadRef.value.clearFiles();
    selected.value = false;
    emit('upload-success');
  }).catch(err => {
    console.log(err)
    uploading.value = false
  })
}

const getUploadUrl = async () => {
  const res = await uploadUrl(props.postId)
  return res.data.url + '/upload?' + res.data.query
}

const submitUpload = () => {
  uploadRef.value.submit()
}

</script>

<style scoped>
.upload{
  margin-bottom: 10px;
}
.upload-btn {
  display: flex;
  justify-content: flex-end;
}

</style>