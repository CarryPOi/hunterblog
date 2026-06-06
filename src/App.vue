<template>
  <div class="bg-fullscreen">
    <!-- 渐变过度遮罩 -->
    <div v-if="showGradient" class="wallpaper-gradient-overlay"></div>
  </div>
  <!-- 火星特效 -->
  <FireSparkEffect v-if="showSakura" />
  <!-- 全局壁纸内容容器 -->
  <div v-if="showHeroSection && (isFullMode || isBannerMode)" 
    class="hero-viewport-container"
    :class="{ 'is-banner': isBannerMode }"
  >
    <!-- 仅首页全屏模式显示标题 -->
    <div v-if="isHomePage && showWpTitle && isFullMode" class="hero-title-container">
      <h1 class="hero-main-title">MONSTER HUNTER</h1>
      <p class="hero-sub-title">新大陆调查团 · 猎人日记</p>
      <div class="scroll-hint">SCROLL DOWN</div>
    </div>

    <!-- 水波纹过度特效 - 独立于标题控制 -->
    <div v-if="showRipple" class="waves-container">
      <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
        </defs>
        <g class="parallax">
          <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(var(--wave-color), 0.7)" />
          <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(var(--wave-color), 0.5)" />
          <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(var(--wave-color), 0.3)" />
          <use xlink:href="#gentle-wave" x="48" y="7" fill="var(--bg-color)" />
        </g>
      </svg>
    </div>
  </div>
  <div id="app">
    <!-- 顶部导航栏 -->
    <Sidebar />
    <!-- 主体内容区域，留出顶部导航栏高度 -->
    <main class="page-content">
      <router-view />
    </main>
  </div>
  <audio
    ref="audioRef"
    :src="selianaTheme"
    preload="auto"
    @timeupdate="onTimeUpdate"
    @loadedmetadata="onLoadedMetadata"
    @ended="onAudioEnded"
    @play="onPlay"
    @pause="onPause"
  ></audio>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import FireSparkEffect from '@/components/FireSparkEffect.vue'
import { musicState, audioRef } from '@/store/musicStore'

const route = useRoute()
const currentMode = ref('full')
const isFullMode = computed(() => currentMode.value === 'full')
const isBannerMode = computed(() => currentMode.value === 'banner')
const isTransparentMode = computed(() => currentMode.value === 'transparent')
const showWpTitle = ref(true)
const showRipple = ref(true)
const showGradient = ref(true)
const showSakura = ref(false)

const isHomePage = computed(() => route.path === '/')
const showHeroSection = computed(() => true) // 支持所有页面显示壁纸容器和特效

const updateState = () => {
  const savedMode = localStorage.getItem('wallpaper-mode') || 'full'
  currentMode.value = savedMode
  
  const savedWpTitle = localStorage.getItem('wp-title')
  showWpTitle.value = savedWpTitle !== 'false'

  const savedRipple = localStorage.getItem('wp-ripple')
  showRipple.value = savedRipple !== 'false'

  const savedGradient = localStorage.getItem('wp-gradient')
  showGradient.value = savedGradient !== 'false'

  const savedSakura = localStorage.getItem('effect-sakura')
  showSakura.value = savedSakura === 'true'
}

const selianaTheme = import.meta.env.BASE_URL + 'music/成田暁彦 - 前線拠点 セリエナのテーマ.mp3'

function onTimeUpdate() {
  if (audioRef.value) musicState.currentTime = audioRef.value.currentTime
}
function onLoadedMetadata() {
  if (audioRef.value) musicState.duration = audioRef.value.duration
}
function onAudioEnded() {
  if (musicState.isLoop) {
    if (audioRef.value) {
      audioRef.value.currentTime = 0
      audioRef.value.play().catch(e => console.warn(e))
    }
  } else {
    musicState.isPlaying = false
    musicState.currentTime = 0
  }
}
function onPlay() { musicState.isPlaying = true }
function onPause() { musicState.isPlaying = false }

onMounted(() => {
  // 初始化主题
  const savedTheme = localStorage.getItem('theme') || 'light'
  document.documentElement.setAttribute('data-theme', savedTheme)
  
  // 初始化壁纸模式
  const savedMode = localStorage.getItem('wallpaper-mode') || 'full'
  document.body.className = document.body.className.replace(/mode-\w+/g, '').trim()
  document.body.classList.add(`mode-${savedMode}`)
  
  updateState()
  
  // 初始化背景显示
  const savedBg = localStorage.getItem('showBg')
  if (savedBg === 'false') {
    const bg = document.querySelector('.bg-fullscreen')
    if (bg) bg.style.display = 'none'
  }

  // 监听 storage 变化（如果用户在其他组件修改了设置）
  window.addEventListener('storage', updateState)
  
  // 轮询检查（简单方案，因为 localStorage 变化在同一个窗口不触发 storage 事件）
  setInterval(updateState, 500)
  
  // 尝试自动播放音乐
  const attemptAutoplay = () => {
    if (audioRef.value && audioRef.value.paused) {
      audioRef.value.play().then(() => {
        // 成功播放后移除交互监听器
        document.removeEventListener('click', attemptAutoplay)
        document.removeEventListener('keydown', attemptAutoplay)
      }).catch(err => {
        console.warn('浏览器拦截了自动播放，等待用户首次交互后播放:', err)
      })
    }
  }

  // 组件挂载时先尝试静默自动播放
  // 某些浏览器政策允许静默或根据用户对网站的偏好允许播放
  setTimeout(attemptAutoplay, 500)

  // 注册全局交互事件，当用户首次点击或按键时触发播放
  document.addEventListener('click', attemptAutoplay, { once: true })
  document.addEventListener('keydown', attemptAutoplay, { once: true })
})
</script>

<style scoped>
/* 全屏背景 */
.bg-fullscreen {
  position: fixed;
  inset: 0;
  background: url('@/assets/image/背景.png') center/cover no-repeat;
  z-index: -1;
  transition: height 0.4s ease, position 0.4s ease;
}

/* 渐变遮罩样式 */
.wallpaper-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 60%,
    rgba(var(--wave-color), 0.2) 80%,
    var(--bg-color) 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* 首页全屏容器 */
.hero-viewport-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 142.86vw; /* 补偿 zoom 0.7: 100 / 0.7 */
  height: 142.86vh; /* 补偿 zoom 0.7: 100 / 0.7 */
  pointer-events: none;
  z-index: 10;
  transition: height 0.4s ease;
}

.hero-viewport-container.is-banner {
  height: 530px;
  width: 100%;
}

/* 首页全屏标题样式 */
.hero-title-container {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  text-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
  z-index: 1;
}

.hero-main-title {
  font-size: 8rem;
  letter-spacing: 1.5rem;
  margin: 0;
  font-weight: 900;
  color: var(--primary-color);
  animation: fadeInDown 1s ease-out;
}

.hero-sub-title {
  font-size: 2.5rem;
  letter-spacing: 0.8rem;
  margin-top: 1rem;
  opacity: 0.9;
  animation: fadeInUp 1s ease-out 0.3s backwards;
}

.scroll-hint {
  position: absolute;
  bottom: 40px;
  font-size: 1.2rem;
  letter-spacing: 0.3rem;
  animation: bounce 2s infinite;
  opacity: 0.7;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

/* 水波纹特效样式 */
.waves-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 15vh;
  min-height: 100px;
  max-height: 150px;
  overflow: hidden;
  pointer-events: none;
  z-index: 10;
}

.waves {
  position: relative;
  width: 100%;
  height: 100%;
  margin-bottom: -7px; /* 修复底部间隙 */
}

/* 动画 */
.parallax > use {
  animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
}
.parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
}
.parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
}
.parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
}
.parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
}

@keyframes move-forever {
  0% { transform: translate3d(-90px, 0, 0); }
  100% { transform: translate3d(85px, 0, 0); }
}

/* 页面内容基础样式 */
.page-content {
  width: 100%;
  /* margin-top 由 style.css 根据壁纸模式统一控制 */
}
</style>
