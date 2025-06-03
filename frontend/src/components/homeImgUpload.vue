<template>
  <div class="container">
    <div class="upload-button">
      <el-upload
          class="upload"
          list-type="picture"
          :auto-upload="false"
          :limit="limit"
          :http-request="uploadFile"
          :on-change="selectFile"
          :on-remove="removeFile"
          ref="uploadRef"
      >
        <el-button type="primary">选择图片</el-button>
        <template #tip>
          <div class="el-upload__tip">
            <span>一次上传一张图片，图片大小2M以内</span>
          </div>
        </template>
      </el-upload>
    </div>
    <div style="max-width: 400px">
      <el-form :model="homeImgForm">
        <el-form-item label="排序">
          <el-input-number v-model="homeImgForm.sortOrder" max="3" min="0" step="1" size="small"></el-input-number>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="homeImgForm.description" size="small"></el-input>
        </el-form-item>
        <el-form-item label="跳转路径">
          <el-input v-model="homeImgForm.redirect_url" size="small"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <el-button type="success" @click="submitUpload" :icon="Upload" :disabled="!selected" :loading="uploading">
        <span>确定上传</span>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { homeImgCreate } from '@/api/homeImg'
import { Upload } from '@element-plus/icons-vue'

const limit = ref(1)
const uploadRef = ref()
const selected = ref(false)
const uploading = ref(false)

const homeImgForm = reactive({
  sortOrder: 0,
  description: '',
  redirect_url: ''
})

const props = defineProps({
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
    ElMessage.warning('请选择图片')
    return;
  }

  const formData = new FormData();
  formData.append('file', file.file)
  formData.append('user_id', props.userId)
  formData.append('sort_order', homeImgForm.sortOrder)
  formData.append('description', homeImgForm.description)
  formData.append('redirect_url', homeImgForm.redirect_url)

  uploading.value = true

  return await homeImgCreate(formData).then(() => {
    ElMessage.success('上传成功');
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