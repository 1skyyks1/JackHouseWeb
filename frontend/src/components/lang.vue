<template>
  <button class="flag-btn" @click="toggleLang">
    <span :class="currentFlag"></span>
  </button>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from 'vue-i18n';
const { locale } = useI18n();

const flags = {
  zh: "fi fi-cn",
  en: "fi fi-gb"
};

const recentLang = ref(locale.value)

const currentFlag = computed(() => flags[recentLang.value]);

const toggleLang = () => {
  recentLang.value = recentLang.value === "zh" ? "en" : "zh";
  locale.value = recentLang.value;
  localStorage.setItem("locale", locale.value);
};

const langChange = () => {
  locale.value = recentLang.value
  localStorage.setItem('locale', locale.value)
}

</script>

<style scoped>
.flag-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  border-radius: 50%;
  padding: 8px;
  transition: background-color 0.3s, box-shadow 0.3s;
}
.flag-btn span {
  display: inline-block;
  line-height: 1;
  border-radius: 15%;
}
.flag-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}
.dark .flag-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.1);
}
</style>