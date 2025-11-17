<template>
  <div v-cloak>
    <navMenu></navMenu>
    <el-row justify="center" :gutter="10">
      <el-col :xs="24" :sm="24" :md="16" :lg="14" :xl="14">
        <el-card v-loading="postLoading" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="post-header">
                <el-icon><Ticket /></el-icon>
                <span>{{ t('post.forumPost') }}</span>
              </div>
              <div>
                <el-button circle plain @click="editPost">
                  <el-icon><EditPen /></el-icon>
                </el-button>
                <el-button circle plain @click="deletePost">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
          <div class="header">
            <div class="title">{{ locale === 'zh' ? zhTitle : enTitle }}</div>
            <div class="info">
              <div class="time">
                <span>{{ formatDate(time) }}</span>
              </div>
              <div class="user">
                <span>{{ t('post.by') }}</span>
                <el-avatar shape="square" :src="avatar"></el-avatar>
                <span>{{ userName }}</span>
              </div>
            </div>
          </div>
          <el-divider></el-divider>
          <div class="prose max-w-none dark:prose-invert js-toc-content" ref="postContentRef" v-html="postContent.value"></div>
        </el-card>
        <el-card style="margin: 10px 0;" shadow="never" v-if="canUpload">
          <mapUpload :postId="Number(postId)" :userId="userId" :limit="limit" @upload-success="getUserPostFiles"/>
        </el-card>
        <el-card style="margin: 10px 0;" shadow="never" v-if="userPostFiles && userPostFiles.length > 0">
          <template #header>
            <div class="card-header">
              <div class="post-header">
                <el-icon><MessageBox /></el-icon>
                <span>{{ t('post.myPostFile') }}</span>
                <el-tooltip
                    :content="t('post.noteTooltip')"
                    placement="top"
                >
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <div>
                <el-tooltip
                    :content="t('post.more')"
                    placement="top"
                >
                  <el-button circle plain @click="goToUserPage(userId)">
                    <el-icon><More /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
          </template>
          <div>
            <div v-for="file in userPostFiles" class="post-file">
              <div>{{ file.file_name }}</div>
              <div class="file-note" v-if="!file.note">
                <el-input
                    v-model="file.tempNote"
                    :placeholder="t('post.addNote')"
                    :disabled="!!file.note"
                    type="textarea"
                />
                <el-button
                    type="primary"
                    plain
                    size="small"
                    :disabled="!!file.note || !file.tempNote"
                    @click="submitNote(file.file_id, file.tempNote)"
                >
                  {{ t('post.submitNote') }}
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
        <el-card style="margin: 10px 0;" v-loading="commentLoading" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="post-header">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ t('post.comments') }}</span>
              </div>
            </div>
          </template>
          <div class="comments">
            <div class="comment-form">
              <el-input
                  type="textarea"
                  :rows="3"
                  v-model="newComment"
                  :placeholder="t('post.placeholder')"
              ></el-input>
              <div style="display: flex; justify-content: right">
                <el-button type="success" plain size="small" style="margin-top: 10px;" @click="createComment">{{ t('post.createComment') }}</el-button>
              </div>
            </div>
            <el-divider class="comment-divider"></el-divider>
            <div class="comment-list">
              <div v-for="comment in comments" :key="comment.id">
                <div class="comment-item">
                  <div class="comment-user" v-if="!isMobile">
                    <el-avatar shape="square" :src="comment.avatar"></el-avatar>
                    <span class="user-name" @click="goToUserPage(comment.user_id)">{{ comment.user_name }}</span>
                    <el-divider direction="vertical" style="height: 100%"/>
                  </div>
                  <div class="comment-content">
                    <span v-if="isMobile">
                      <span class="user-name" @click="goToUserPage(comment.user_id)">{{ comment.user_name }}</span>
                      :
                    </span>
                    {{ comment.comment }}
                  </div>
                  <div class="bottom">
                    <el-button text class="delete" v-if="String(comment.user_id) === String(userId)" @click="deletePostComment(comment.comment_id)">{{ t('post.deleteComment') }}</el-button>
                    <div class="comment-time">{{ formatDate(comment.created_time) }}</div>
                  </div>
                </div>
                <el-divider class="comment-divider"></el-divider>
              </div>
            </div>
            <el-pagination
                style="margin-top: 20px; justify-content: center"
                background
                layout="prev, pager, next"
                :page-size="pageSize"
                :total="totalComments"
                @current-change="handlePageChange"
                hide-on-single-page
            ></el-pagination>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="0" :sm="0" :md="4" :lg="4" :xl="3">
        <div class="toc-box">
          <div class="js-toc"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import navMenu from '../components/navmenu.vue'
import mapUpload from '../components/mapUpload.vue'
import {useRoute} from "vue-router";
import {postById, postDelete} from "@/api/post"
import {computed, nextTick, onBeforeMount, onBeforeUnmount, ref, watch} from "vue";
import {useStore} from "vuex"
import {useI18n} from 'vue-i18n';
import {commentByPostId, postCommentCreate, postCommentDelete} from "@/api/postComment";
import {postFileByPostAndUser, postFileUpdate} from "@/api/postFile.js";
import {dayjs, ElMessage, ElMessageBox} from "element-plus";
import {ChatDotRound, Delete, EditPen, MessageBox, More, QuestionFilled, Ticket} from '@element-plus/icons-vue'
import router from "@/router";
import {useBreakpoints} from '@vueuse/core';
import tocbot from 'tocbot'
import 'tocbot/dist/tocbot.css'

const { t, locale } = useI18n();

const breakpoints = useBreakpoints({
  tablet: 768,
  laptop: 992,
  desktop: 1200,
});

const isMobile = breakpoints.smaller('tablet');

const route = useRoute()
const store = useStore()

const postLoading = ref(true)
const commentLoading = ref(true)

const postId = route.params.post_id
const postUserId = ref(null)
const userId = computed(() => store.state.userId);
const userName = ref('')
const avatar = ref('');
const role = ref(0)
const time = ref(null)
const postType = ref(0)
const end = ref(null)
const limit = ref(null)

const userPostFiles = ref([])

const newComment = ref('')
const comments = ref([])
const pageSize = ref(10)
const currentPage = ref(1)
const totalComments = ref(0)
const zhTitle = ref('')
const zhContent = ref('')
const enTitle = ref('')
const enContent = ref('')
const postContentRef = ref(null);
const postContent = computed(() => locale.value === 'zh' ? zhContent : enContent);

const getPostInfo = async () => {
  try {
    const response = await postById(postId);
    const zhTranslation = response.data.translations.find(t => t.language === 'zh');
    const enTranslation = response.data.translations.find(t => t.language === 'en');

    zhTitle.value = zhTranslation?.title || enTranslation?.title || t('post.noTitle');
    zhContent.value = zhTranslation?.content || enTranslation?.content || t('post.noContent');
    enTitle.value = enTranslation?.title || zhTranslation?.title || t('post.noTitle');
    enContent.value = enTranslation?.content || zhTranslation?.content || t('post.noContent');

    postUserId.value = response.data.user_id
    time.value = response.data.created_time
    userName.value = response.data.user.user_name;
    avatar.value = response.data.user.avatar;
    role.value = response.data.user.role;
    postType.value = response.data.type;
    end.value = response.data.end;
    limit.value = response.data.limit;
    postLoading.value = false;
  } catch (error) {
    postLoading.value = false;
  }
}

const getCommentsByPostId = () => {
  commentByPostId(currentPage.value, pageSize.value, postId).then(response => {
    comments.value = response.data;
    totalComments.value = response.total;
    commentLoading.value = false;
  })
}

const editPost = () => {
  router.push('/forum/editor/' + postId);
}

const createComment = () => {
  if (!userId.value) {
    ElMessage.warning(t('post.login'))
    store.commit('SET_LOGIN_DIALOG', true)
    return
  }
  let comment = {
    user_id: userId.value,
    post_id: postId,
    comment: newComment.value
  }
  postCommentCreate(comment).then(() => {
    ElMessage.success(t('post.postSuccess'))
    newComment.value = ''
    getCommentsByPostId()
  })
}

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD');
}

const handlePageChange = (page) => {
  currentPage.value = page;
  getCommentsByPostId();
}

const deletePostComment = (commentId) => {
  postCommentDelete(commentId).then(() => {
    ElMessage.success(t('post.deleteCommentSuccess'))
    getCommentsByPostId()
  })
}

const deletePost = () => {
  if(String(userId.value) !== String(postUserId.value)){
    ElMessage.warning(t('post.delete.isNotMyPost'))
    return
  }
  ElMessageBox.confirm(
      t('post.delete.text'),
      t('post.delete.warning'),
      {
        confirmButtonText: t('post.delete.confirm'),
        cancelButtonText: t('post.delete.cancel'),
        type: 'warning',
      }
  ).then(() => {
    postDelete(postId).then(() => {
      ElMessage.success(t('post.delete.success'))
      router.push('/forum')
    }).catch(err => {
    ElMessage.error(err)
    })
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: t('post.delete.cancelText'),
    })
  })
}

const goToUserPage = (userId) => {
  router.push('/user/' + userId)
}

const getUserPostFiles = () => {
  console.log('getUserPostFiles');
  if(postType.value !== 1){
    console.log('not request')
    return
  }
  postFileByPostAndUser(postId).then(response => {
    userPostFiles.value = response.data.map(file => ({
      ...file,
      tempNote: ''
    }));
  })
}

const submitNote = (fileId, tempNote) => {
  postFileUpdate(fileId, { note: tempNote }).then(() => {
    ElMessage.success(t('post.addNoteSuccess'))
    getUserPostFiles();
  })
}

const canUpload = computed(() => {
  if(postType.value === 1) {
    const now = new Date();
    const endDate = new Date(end.value);
    return now < endDate;
  }
  else {
    return false
  }
})

async function rebuildToc() {
  await nextTick();
  if (!postContentRef.value) {
    console.warn('TOC: postContentRef is not ready.');
    return;
  }
  const headings = postContentRef.value.querySelectorAll('h1, h2, h3, h4, h5');
  headings.forEach((h, index) => {
    if (!h.id) {
      h.id = (h.innerText || `header-${index}`).trim().toLowerCase().replace(/\s+/g, '-') // 替换空格为 -.replace(/[^\w-]+/g, '');
    }
  });

  tocbot.destroy();

  tocbot.init({
    // Where to render the table of contents.
    tocSelector: '.js-toc',
    // Or, you can pass in a DOM node instead
    tocElement: null,
    // Where to grab the headings to build the table of contents.
    contentSelector: '.js-toc-content',
    // Or, you can pass in a DOM node instead
    contentElement: null,
    // Which headings to grab inside of the contentSelector element.
    headingSelector: 'h1, h2, h3, h4, h5',
    // Headings that match the ignoreSelector will be skipped.
    ignoreSelector: '.js-toc-ignore',
    // For headings inside relative or absolute positioned
    // containers within content.
    hasInnerContainers: false,
    // Main class to add to links.
    linkClass: 'toc-link',
    // Extra classes to add to links.
    extraLinkClasses: '',
    // Class to add to active links,
    // the link corresponding to the top most heading on the page.
    activeLinkClass: 'is-active-link',
    // Main class to add to lists.
    listClass: 'toc-list',
    // Extra classes to add to lists.
    extraListClasses: '',
    // Class that gets added when a list should be collapsed.
    isCollapsedClass: 'is-collapsed',
    // Class that gets added when a list should be able
    // to be collapsed but isn't necessarily collapsed.
    collapsibleClass: 'is-collapsible',
    // Class to add to list items.
    listItemClass: 'toc-list-item',
    // Class to add to active list items.
    activeListItemClass: 'is-active-li',
    // How many heading levels should not be collapsed.
    // For example, number 6 will show everything since
    // there are only 6 heading levels and number 0 will collapse them all.
    // The sections that are hidden will open
    // and close as you scroll to headings within them.
    collapseDepth: 4,
    // Smooth scrolling enabled.
    // CAUTION: Doesn't work well of you already have scroll-behavior set to smooth globally in your CSS - see https://github.com/tscanlin/tocbot/issues/273#issuecomment-2916799033
    scrollSmooth: false,
    // Smooth scroll duration.
    scrollSmoothDuration: 420,
    // Smooth scroll offset.
    scrollSmoothOffset: 0,
    // Callback for scroll end.
    scrollEndCallback: function (e) {},
    // Headings offset between the headings and the top of
    // the document (this is meant for minor adjustments).
    headingsOffset: 0,
    // Enable the URL hash to update with the proper heading ID as
    // a user scrolls the page.
    enableUrlHashUpdateOnScroll: false,
    // type of scroll handler to use. to make scroll event not too rapid.
    // Options are: "debounce" or "throttle"
    // when set auto , use debounce less than 333ms , other use throttle.
    // for ios browser can't use history.pushState() more than 100 times per 30 seconds reason
    scrollHandlerType: 'auto',
    //  scrollHandler delay in ms.
    scrollHandlerTimeout: 50,
    // Timeout between events firing to make sure it's
    // not too rapid (for performance reasons).
    throttleTimeout: 50,
    // Element to add the positionFixedClass to.
    positionFixedSelector: null,
    // Fixed position class to add to make sidebar fixed after scrolling
    // down past the fixedSidebarOffset.
    positionFixedClass: 'is-position-fixed',
    // fixedSidebarOffset can be any number but by default is set
    // to auto which sets the fixedSidebarOffset to the sidebar
    // element's offsetTop from the top of the document on init.
    fixedSidebarOffset: 'auto',
    // includeHtml can be set to true to include the HTML markup from the
    // heading node instead of just including the innerText.
    includeHtml: false,
    // includeTitleTags automatically sets the html title tag of the link
    // to match the title. This can be useful for SEO purposes or
    // when truncating titles.
    includeTitleTags: false,
    // onclick function to apply to all links in toc. will be called with
    // the event as the first parameter, and this can be used to stop,
    // propagation, prevent default or perform action
    onClick: function (e) {},
    // orderedList can be set to false to generate unordered lists (ul)
    // instead of ordered lists (ol)
    orderedList: true,
    // If there is a fixed article scroll container, set to calculate offset.
    scrollContainer: 'body',
    // prevent ToC DOM rendering if it's already rendered by an external system.
    skipRendering: false,
    // Optional callback to change heading labels.
    // For example it can be used to cut down and put ellipses on multiline headings you deem too long.
    // Called each time a heading is parsed. Expects a string and returns the modified label to display.
    // Additionally, the attribute `data-heading-label` may be used on a heading to specify
    // a shorter string to be used in the TOC.
    // function (string) => string
    headingLabelCallback: false,
    // ignore headings that are hidden in DOM
    ignoreHiddenElements: false,
    // Optional callback to modify properties of parsed headings.
    // The heading element is passed in node parameter and information
    // parsed by default parser is provided in obj parameter.
    // Function has to return the same or modified obj.
    // The heading will be excluded from TOC if nothing is returned.
    // function (object, HTMLElement) => object | void
    headingObjectCallback: null,
    // Set the base path, useful if you use a `base` tag in `head`.
    basePath: '',
    // Only takes affect when `tocSelector` is scrolling,
    // keep the toc scroll position in sync with the content.
    disableTocScrollSync: false,
    // If this is null then just use `tocElement` or `tocSelector` instead
    // assuming `disableTocScrollSync` is set to false. This allows for
    // scrolling an outer element (like a nav panel w/ search) containing the toc.
    // Please pass an element, not a selector here.
    tocScrollingWrapper: null,
    // Offset for the toc scroll (top) position when scrolling the page.
    // Only effective if `disableTocScrollSync` is false.
    tocScrollOffset: 30,
    // Threshold for when bottom mode should be enabled to handle
    // highlighting links that cannot be scrolled to.
    bottomModeThreshold: 30,
  });
}

watch(postContent, (newValue) => {
  if (newValue) {
    rebuildToc();
  }
});

onBeforeMount(async () => {
  await getPostInfo();
  await rebuildToc();
  getUserPostFiles();
  getCommentsByPostId();
});

onBeforeUnmount(() => {
  tocbot.destroy();
});

onBeforeUnmount(() => {
  tocbot.destroy();
});
</script>

<style scoped>
[v-cloak]{
  display: none !important;
}
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
.header{
  margin: 4px 4px 0 4px;
}
.title{
  font-weight: bold;
  font-size: 24px;
}
.info{
  margin-top: 20px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.user{
  display: flex;
  align-items: center;
  gap: 8px;
}
.el-divider{
  margin-top: 8px;
}
.comment-form {
  margin-bottom: 20px;
}
.comment-divider{
  margin-bottom: 10px;
}
.comment-list {
  margin-top: 5px;
}
.comment-item {
  margin-bottom: 10px;
  display: flex;
  position: relative;
  padding: 5px 5px 20px;
}
.comment-user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
}
.comment-content {
  margin-left: 10px;
  font-size: 14px;
}
.comment-time {
  font-size: 12px;
  color: #999;
}
.el-pagination {
  margin-top: 20px;
  text-align: center;
}
.bottom{
  position: absolute;
  right: 10px;
  bottom: 0;
  display: flex;
  justify-content: right;
  align-items: center;
}
.delete{
  font-size: 11px;
  margin: 1px 6px 0;
  padding: 0 6px;
}
:deep(.el-dialog) {
  min-width: 400px;
}
.rich-text-content :deep(img) {
  max-width: 100%;
  height: auto;
}
.user-name {
  font-weight: bold;
  cursor: pointer;
  &:hover{
    text-decoration: underline;
  }
}
.post-file {
  margin-bottom: 10px;
}
.file-note {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.card-header {
  height: 32px;
}
.toc-box {
  position: sticky;
  top: 70px;
  padding: 10px;
}
.toc-box :deep(.toc-link) {
  position: relative;
}
.toc-box :deep(.toc-link::before) {
  background-color: #bababa;
  content: "";
  position: absolute;
  left: -10px;
  top: 2px;
  width: 2px;
  height: 100%;
}
.toc-box :deep(.is-active-link::before) {
  background-color: #54bc4b;
}
:deep(.js-toc-content h1),
:deep(.js-toc-content h2),
:deep(.js-toc-content h3),
:deep(.js-toc-content h4),
:deep(.js-toc-content h5) {
  scroll-margin-top: 70px;
}
:deep(.js-toc .node-name--H3){
  font-size: 14px;
}
:deep(.js-toc .node-name--H4){
  font-size: 12px;
}
:deep(.js-toc .node-name--H5){
  font-size: 12px;
}
</style>