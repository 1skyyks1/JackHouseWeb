<template>
  <div class="tinymce-box">
    <Editor
        v-model="myValue"
        :init="init"
        :disabled="disabled"
        @click="onClick"
    />
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import tinymce from 'tinymce/tinymce'; // tinymce 核心
import Editor from '@tinymce/tinymce-vue'; // tinymce-vue 组件

// 引入富文本编辑器主题的js和css
import 'tinymce/skins/content/default/content.css';
import 'tinymce/themes/silver/theme.min.js';
import 'tinymce/icons/default/icons'; // 解决 icons.js 报错 Unexpected token '<'

// 编辑器插件
import 'tinymce/plugins/image'; // 插入上传图片插件
import 'tinymce/plugins/media'; // 插入视频插件
import 'tinymce/plugins/table'; // 插入表格插件
import 'tinymce/plugins/lists'; // 列表插件
import 'tinymce/plugins/wordcount'; // 字数统计插件
import 'tinymce/plugins/link';
import 'tinymce/plugins/code';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/help';

export default {
  name: 'Tinymce',
  components: {
    Editor,
  },
  props: {
    // 默认的富文本内容
    value: {
      type: String,
      default: '',
    },
    // 基本路径，默认为空根目录
    baseUrl: {
      type: String,
      default: window.location.origin ? window.location.origin : '',
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false,
    },
    // 插件配置
    plugins: {
      type: [String, Array],
      default: 'link lists image code table wordcount media preview fullscreen help',
    },
    // 工具栏配置
    toolbar: {
      type: [String, Array],
      default:
          'bold italic underline strikethrough | fontsizeselect | formatselect | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent blockquote | undo redo | link unlink code lists table image media | removeformat | fullscreen preview',
    },
  },
  emits: ['input', 'onClick'], // 定义 emits
  setup(props, { emit }) {
    const myValue = ref(props.value);

    // 初始化配置
    const init = {
      language_url: `${props.baseUrl}/tinymce/langs/zh_CN.js`,
      language: 'zh_CN',
      skin_url: `${props.baseUrl}/tinymce/skins/ui/oxide`,
      convert_urls: false,
      height: 300,
      plugins: props.plugins,
      toolbar: props.toolbar,
      statusbar: true,
      menubar: 'file edit insert view format table tools help',
      branding: false,
      images_upload_handler: (blobInfo, success, failure) => {
        const img = 'data:image/jpeg;base64,' + blobInfo.base64();
        success(img);
        console.log(failure);
      },
    };

    // 监听 value 的变化
    watch(
        () => props.value,
        (newValue) => {
          myValue.value = newValue;
        }
    );

    // 监听 myValue 的变化并触发 input 事件
    watch(myValue, (newValue) => {
      emit('input', newValue);
    });

    // 点击事件
    const onClick = (e) => {
      emit('onClick', e, tinymce);
    };

    // 清空内容
    const clear = () => {
      myValue.value = '';
    };

    // 初始化 tinymce
    onMounted(() => {
      tinymce.init({});
    });

    return {
      myValue,
      init,
      onClick,
      clear,
    };
  },
};
</script>

<style scoped>
.tinymce-box {
  width: 100%;
}
</style>