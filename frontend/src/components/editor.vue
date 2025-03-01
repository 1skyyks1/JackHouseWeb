<template>
  <quill-editor ref="editorRef" v-model:content="content" :options="options" contentType="html">
  </quill-editor>
</template>

<script setup>
import { onMounted, ref, toRaw, nextTick, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Quill, QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const content = ref()
const editorRef = ref()

const options = {
  modules: {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'], // 加粗 斜体 下划线 删除线
        [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色
        [{ header: [1, 2, 3, 4, 5, 6, false] }], // 标题
        [{ list: 'ordered' }, { list: 'bullet' }], // 有序、无序列表
        ['link', 'image'], // 链接、图片
      ],
    },
  }
}

</script>

<style>
.ql-container{
  min-height: 400px;
}
</style>