<template>
  <div style="border: 1px solid #ccc">
    <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
    />
    <Editor
        style="height: 400px; overflow-y: hidden;"
        :modelValue="modelValue"
        @update:modelValue="handleChange"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        class="prose max-w-none"
    />
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css

import { onBeforeUnmount, ref, shallowRef, onMounted, nextTick } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { DomEditor } from "@wangeditor/editor"
import { i18nChangeLanguage } from '@wangeditor/editor'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

i18nChangeLanguage('en')

const emit = defineEmits(['update:modelValue'])

const editorRef = shallowRef()
const mode = 'default'
const toolbarConfig = {}
const editorConfig = {}

toolbarConfig.toolbarKeys = [
  'headerSelect','fontSize','fontFamily',
  'color',
  'bgColor',
  'bold',
  'italic',
  'underline',
  {
    key: 'group-more-style',
    iconSvg: "<svg viewBox=\"0 0 1024 1024\"><path d=\"M204.8 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z\"></path><path d=\"M505.6 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z\"></path><path d=\"M806.4 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z\"></path></svg>",
    menuKeys: ['through', 'clearStyle'],
  },
  '|',
  "bulletedList",
  "numberedList",
  "insertTable",
  {
    key: "group-justify",
    iconSvg: "<svg viewBox=\"0 0 1024 1024\"><path d=\"M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z\"></path></svg>",
    menuKeys: [
      "justifyLeft",
      "justifyRight",
      "justifyCenter",
      "justifyJustify"
    ]
  },
  "insertLink",
  {
    key: "group-image",
    iconSvg: "<svg viewBox=\"0 0 1024 1024\"><path d=\"M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z\"></path></svg>",
    menuKeys: [
      "insertImage",
    ]
  },
  "emotion",
  "divider",
  '|',
  "undo",
  "redo",
]

// toolbarConfig.excludeKeys = [
//   'fullScreen','codeBlock','todo','lineHeight','blockquote','group-indent','group-video','uploadImage'
// ]

const handleCreated = (editor) => {
  editorRef.value = editor
  nextTick(() => {
    const toolbar = DomEditor.getToolbar(editor);
    // console.log(toolbar.getConfig().toolbarKeys)
  })
}

const handleChange = () => {
  const editor = editorRef.value
  const html = editor.getHtml()
  emit('update:modelValue', html)
}

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
</script>