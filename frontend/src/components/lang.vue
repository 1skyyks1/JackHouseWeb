<template>
  <el-select @change="langChange" v-model="recentLang" :popper-append-to-body="false" class="select-box">
    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
        <span style="float: left">
          <img :src="item.icon" alt="" height="20px" style="padding-top: 7px">
        </span>
      <span style="float: left; padding-left: 5px">{{ item.label }}</span>
    </el-option>
    <template #prefix>
      <span style="display: inline-flex; align-items: center;">
        <img :src="options.find(item => item.value === recentLang).icon" alt="" height="20px">
      </span>
    </template>
  </el-select>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useI18n } from 'vue-i18n';
const { locale } = useI18n();


const options = reactive([{
  value: 'zh',
  label: '简体中文',
  icon: 'https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f1e8-1f1f3.svg'
},{
  value: 'en',
  label: 'English',
  icon: 'https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f1ec-1f1e7.svg'
}])

const recentLang = ref(locale.value)

const langChange = () => {
  locale.value = recentLang.value
  localStorage.setItem('locale', locale.value)
}

</script>

<style scoped>
.select-box{
  width: 130px;
  height: 40px;
  margin: 8px 20px;
  border-radius: 10px;
}
</style>