<template>
  <div class="immersive-wrapper">
    <navMenu class="fixed-nav"></navMenu>
    <swiper
        :direction="'vertical'"
        :slidesPerView="1"
        :spaceBetween="0"
        :mousewheel="true"
        :speed="600"
        :autoplay="{
          delay: 5000,
        }"
        :modules="modules"
        :effect="'creative'"
        :creativeEffect="{
        prev: {
          shadow: true,
          translate: [0, '-20%', -1],
          opacity: 0.6,
          scale: 0.8
        },
        next: {
          translate: [0, '100%', 0],
        },
      }"
        @slideChange="onSlideChange"
        class="mySwiper"
    >
      <swiper-slide v-for="(slide, index) in slides" :key="index">
        <div
            class="slide-bg"
            :style="{ backgroundImage: `url(${slide.bg})` }"
            data-swiper-parallax="50%"
            data-swiper-parallax-scale="1.1"
        >
          <div class="bg-overlay"></div>
        </div>

        <div class="slide-content relative z-10 flex flex-col items-center justify-center h-full text-center px-4">

          <h1 class="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter title-glow" style="font-family: 'Arial Black', sans-serif;">
            <span class="typing-wrapper">
              {{ currentTypingText[index] }}<span class="cursor" :style="{backgroundColor: slide.color}"></span>
            </span>
          </h1>

          <p class="text-lg md:text-2xl text-gray-300 mb-12 max-w-2xl font-light" data-swiper-parallax="-100">
            {{ t('home.' + slide.name + '.desc') }}
          </p>

          <button
              class="game-btn"
              :style="{ '--btn-color': slide.color }"
              @click="goTo(slide.link)"
              data-swiper-parallax="-200"
          >
            <span class="btn-text">{{ t('home.' + slide.name + '.button') }}</span>
            <div class="btn-bg"></div>
          </button>

        </div>
      </swiper-slide>

    </swiper>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import navMenu from '../components/navmenu.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Mousewheel, Pagination, EffectCreative, Parallax, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-creative';
import { House, Box, TrophyBase } from '@element-plus/icons-vue';

const bgImages = [
  'https://i.imgs.ovh/2025/11/21/CFq4M0.png',
  'https://i.imgs.ovh/2025/11/21/CFkd4A.jpeg',
  'https://i.imgs.ovh/2025/11/21/CFgMPQ.jpeg'
];

const router = useRouter();
const modules = [Mousewheel, Pagination, EffectCreative, Parallax, Autoplay];

const slides = [
  {
    name: 'home',
    title: 'JACK HOUSE',
    desc: 'A community for Jack players.',
    bg: bgImages[0],
    icon: House,
    link: '/forum',
    color: '#6366f1'
  },
  {
    name: 'maps',
    title: 'JACKMAPS',
    desc: 'Search and discover Jack maps you want.',
    bg: bgImages[1],
    icon: Box,
    link: '/pack',
    color: '#10b981'
  },
  {
    name: 'tourney',
    title: 'TOURNEY',
    desc: 'Test your skill against Jack players from around the world.',
    bg: bgImages[2],
    icon: TrophyBase,
    link: '/t',
    color: '#f43f5e'
  }
];

const currentTypingText = ref(slides.map(() => ""));
let typingTimeouts = [];

const startTyping = (index) => {
  typingTimeouts.forEach(t => clearTimeout(t));
  typingTimeouts = [];

  currentTypingText.value[index] = "";
  const textToType = slides[index].title;
  let charIndex = 0;

  const typeChar = () => {
    if (charIndex < textToType.length) {
      currentTypingText.value[index] += textToType.charAt(charIndex);
      charIndex++;
      const timeout = setTimeout(typeChar, 100 + Math.random() * 50);
      typingTimeouts.push(timeout);
    }
  };

  setTimeout(typeChar, 300);
};

const onSlideChange = (swiper) => {
  startTyping(swiper.activeIndex);
};

const goTo = (link) => {
  router.push(link);
};

onMounted(() => {
  startTyping(0);
});
</script>

<style scoped>
.immersive-wrapper {
  width: 100vw;
  height: 100vh;
  background: #000;
  position: relative;
}

:deep(.fixed-nav) {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 50;
  background: transparent !important;
  border-bottom: 1px solid rgba(255,255,255,0.05) !important;
  backdrop-filter: blur(2px);
  box-shadow: none !important;
}

:deep(.fixed-nav .el-menu-item),
:deep(.fixed-nav .logo),
:deep(.fixed-nav .dark-mode-svg) {
  color: #fff !important;
}

.mySwiper {
  width: 100%;
  height: 100%;
}

.slide-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.8) 100%);
  backdrop-filter: grayscale(30%);
}

.glass-icon {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 30px rgba(0,0,0,0.5);
}

.title-glow {
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.cursor {
  display: inline-block;
  width: 12px;
  height: 0.8em;
  margin-left: 10px;
  vertical-align: middle;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.game-btn {
  position: relative;
  background: transparent;
  border: none;
  padding: 10px 30px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
}

.btn-text {
  position: relative;
  z-index: 2;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 4px;
  text-transform: uppercase;
  transition: color 0.3s;
}

.btn-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid var(--btn-color);
  background: rgba(0,0,0,0.5);
  transform: skewX(-20deg);
  transition: all 0.3s;
  z-index: 1;
}

.game-btn:hover .btn-bg {
  background: var(--btn-color);
  transform: skewX(-20deg) scale(1.05);
  box-shadow: 0 0 30px var(--btn-color);
}

.game-btn:hover .btn-text {
  color: #000;
}

:deep(.custom-pagination) {
  z-index: 50;
}

.swiper-pagination-progressbar :deep(.swiper-pagination-progressbar-fill){
  background: gray;
}
</style>