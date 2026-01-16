<template>
  <div class="rules-container">
    <!-- 规则内容区域 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="18" :lg="18" :xl="18">
        <el-card shadow="never" class="rules-card">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>{{ locale === 'zh' ? '赛事规则' : 'Rules' }}</span>
            </div>
          </template>
          <div 
            class="prose max-w-none dark:prose-invert js-toc-content rules-content" 
            ref="rulesContentRef" 
            v-html="ruleContent"
          ></div>
          <el-empty v-if="!ruleContent" :description="locale === 'zh' ? '暂无规则' : 'No rules yet'" />
        </el-card>
      </el-col>
      <!-- TOC 目录 仅桌面端显示 -->
      <el-col :xs="0" :sm="0" :md="6" :lg="6" :xl="6">
        <div class="toc-box">
          <div class="toc-title">{{ locale === 'zh' ? '目录' : 'Contents' }}</div>
          <div class="js-toc"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Document } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import tocbot from 'tocbot'
import 'tocbot/dist/tocbot.css'

const props = defineProps({
  tournament: { type: Object, default: null }
})

const { locale } = useI18n()
const rulesContentRef = ref(null)

// 根据语言获取规则内容
const ruleContent = computed(() => {
  if (!props.tournament) return ''
  return locale.value === 'zh' 
    ? (props.tournament.rule_zh || props.tournament.rule_en || '') 
    : (props.tournament.rule_en || props.tournament.rule_zh || '')
})

// 重建 TOC
async function rebuildToc() {
  await nextTick()
  if (!rulesContentRef.value) return
  
  // 为标题添加 ID
  const headings = rulesContentRef.value.querySelectorAll('h1, h2, h3, h4, h5')
  headings.forEach((h, index) => {
    if (!h.id) {
      h.id = (h.innerText || `header-${index}`).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') || `heading-${index}`
    }
  })

  tocbot.destroy()
  tocbot.init({
    tocSelector: '.js-toc',
    contentSelector: '.js-toc-content',
    headingSelector: 'h1, h2, h3, h4, h5',
    ignoreSelector: '.js-toc-ignore',
    hasInnerContainers: false,
    linkClass: 'toc-link',
    activeLinkClass: 'is-active-link',
    listClass: 'toc-list',
    listItemClass: 'toc-list-item',
    activeListItemClass: 'is-active-li',
    collapseDepth: 6,
    scrollSmooth: false,
    disableTocScrollSync: true,
    headingsOffset: 80,
    // 自定义点击处理
    onClick: function(e) {
      e.preventDefault()
      const targetId = e.target.getAttribute('href')?.replace('#', '')
      if (targetId) {
        const targetEl = document.getElementById(targetId)
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
      return false
    }
  })
}

// 监听内容变化重建 TOC
watch(ruleContent, (newValue) => {
  if (newValue) {
    rebuildToc()
  }
})

onMounted(() => {
  if (ruleContent.value) {
    rebuildToc()
  }
})

onBeforeUnmount(() => {
  tocbot.destroy()
})
</script>

<style scoped>
.rules-container {
  min-height: 400px;
}

.rules-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.rules-content {
  line-height: 1.8;
}

/* TOC 样式 */
.toc-box {
  position: sticky;
  top: 70px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.toc-title {
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color);
}

.toc-box :deep(.toc-link) {
  position: relative;
  display: block;
  padding: 4px 0 4px 12px;
  color: var(--el-text-color-regular);
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s;
}

.toc-box :deep(.toc-link::before) {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  width: 2px;
  height: calc(100% - 8px);
  background-color: var(--el-border-color);
  transition: background-color 0.2s;
}

.toc-box :deep(.toc-link:hover) {
  color: var(--el-color-primary);
}

.toc-box :deep(.is-active-link) {
  color: var(--el-color-primary);
  font-weight: 500;
}

.toc-box :deep(.is-active-link::before) {
  background-color: var(--el-color-primary);
}

.toc-box :deep(.toc-list) {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.toc-box :deep(.toc-list .toc-list) {
  padding-left: 12px;
}

/* 富文本内容中的标题滚动偏移 */
:deep(.js-toc-content h1),
:deep(.js-toc-content h2),
:deep(.js-toc-content h3),
:deep(.js-toc-content h4),
:deep(.js-toc-content h5) {
  scroll-margin-top: 70px;
}
</style>
