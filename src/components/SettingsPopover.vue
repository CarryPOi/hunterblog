<template>
  <Transition name="slide-fade">
    <div v-if="isOpen" class="settings-popover glass" v-click-outside="close">
      <div class="popover-arrow"></div>

      <!-- 主题外观 -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">主题外观</h3>
        </div>
        <div class="flex-options">
          <button 
            class="option-btn flex-1"
            :class="{ active: currentTheme === 'light' }"
            @click="setTheme('light')"
          >
            ☀️ 亮色
          </button>
          <button 
            class="option-btn flex-1"
            :class="{ active: currentTheme === 'dark' }"
            @click="setTheme('dark')"
          >
            🌙 暗色
          </button>
        </div>
      </div>
      
      <!-- 主题色相 -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">主题色相</h3>
          <button class="reset-btn" @click="resetHue" title="重置">↺</button>
          <span class="value-badge">{{ currentHue }}</span>
        </div>
        <div class="hue-slider-container">
          <input 
            type="range" 
            min="0" 
            max="360" 
            v-model="currentHue" 
            @input="updateHue"
            class="hue-slider"
          >
        </div>
      </div>

      <!-- 壁纸模式 -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">壁纸模式</h3>
          <button class="reset-btn" @click="resetWallpaperMode">↺</button>
        </div>
        <div class="grid-options">
          <button 
            v-for="mode in wallpaperModes" 
            :key="mode.id"
            class="option-btn"
            :class="{ active: currentWallpaperMode === mode.id }"
            @click="setWallpaperMode(mode.id)"
          >
            <span class="option-icon">{{ mode.icon }}</span>
            {{ mode.label }}
          </button>
        </div>
      </div>

      <!-- 壁纸设置 -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">壁纸设置</h3>
        </div>
        <div class="toggle-list">
          <div class="toggle-item" v-for="item in wallpaperSettings" :key="item.id">
            <span class="toggle-label">{{ item.icon }} {{ item.label }}</span>
            <div class="switch-container">
              <input type="checkbox" :id="item.id" v-model="item.value" @change="updateWallpaperSetting(item)">
              <label :for="item.id" class="switch-label"></label>
            </div>
          </div>
        </div>
      </div>

      <!-- 特效设置 -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">特效设置</h3>
        </div>
        <div class="toggle-list">
          <div class="toggle-item">
            <span class="toggle-label">🔥 火星特效</span>
            <div class="switch-container">
              <input type="checkbox" id="effect-sakura" v-model="sakuraEffect" @change="toggleSakura">
              <label for="effect-sakura" class="switch-label"></label>
            </div>
          </div>
        </div>
      </div>

    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

// 状态
const currentTheme = ref('light')
const currentHue = ref(260)
const currentWallpaperMode = ref('full')
const sakuraEffect = ref(false)

const wallpaperModes = [
  { id: 'banner', label: '横幅壁纸', icon: '🖼️' },
  { id: 'full', label: '全屏壁纸', icon: '📱' },
  { id: 'transparent', label: '全屏透明', icon: '🔳' },
  { id: 'pure', label: '纯色背景', icon: '🎨' }
]

const wallpaperSettings = ref([
  { id: 'wp-title', label: '首页壁纸标题', icon: 'Tt', value: true },
  { id: 'wp-ripple', label: '水波纹动画', icon: '≈', value: true },
  { id: 'wp-gradient', label: '渐变过渡', icon: '░', value: true }
])

// 逻辑方法
const close = () => {
  if (props.isOpen) emit('close')
}

const setTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
  currentTheme.value = theme
}

const updateHue = () => {
  document.documentElement.style.setProperty('--theme-hue', currentHue.value)
  localStorage.setItem('theme-hue', currentHue.value)
}

const resetHue = () => {
  currentHue.value = 260
  updateHue()
}

const setWallpaperMode = (mode) => {
  currentWallpaperMode.value = mode
  document.body.className = document.body.className.replace(/mode-\w+/g, '').trim()
  document.body.classList.add(`mode-${mode}`)
  localStorage.setItem('wallpaper-mode', mode)
}

const resetWallpaperMode = () => {
  setWallpaperMode('full')
}

const updateWallpaperSetting = (item) => {
  localStorage.setItem(item.id, item.value)
  // 触发全局状态更新，以便 App.vue 响应
  window.dispatchEvent(new Event('storage'))
}

const toggleSakura = () => {
  localStorage.setItem('effect-sakura', sakuraEffect.value)
  window.dispatchEvent(new Event('storage'))
}

onMounted(() => {
  // 加载保存的设置
  const savedTheme = localStorage.getItem('theme') || 'light'
  currentTheme.value = savedTheme
  document.documentElement.setAttribute('data-theme', savedTheme)

  currentHue.value = parseInt(localStorage.getItem('theme-hue') || '260')
  updateHue()

  const savedMode = localStorage.getItem('wallpaper-mode') || 'full'
  setWallpaperMode(savedMode)

  sakuraEffect.value = localStorage.getItem('effect-sakura') === 'true'

  wallpaperSettings.value.forEach(item => {
    const saved = localStorage.getItem(item.id)
    if (saved !== null) item.value = saved === 'true'
  })
})

// 自定义指令
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    setTimeout(() => {
      document.addEventListener('click', el._clickOutside)
    }, 0)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  }
}
</script>

<style scoped>
.settings-popover {
  position: absolute;
  top: calc(100% + 15px);
  right: 0;
  width: 280px;
  padding: 1.2rem;
  z-index: 3000;
  transform-origin: top right;
  max-height: 80vh;
  overflow-y: auto;
}

/* 隐藏滚动条但保留滚动功能 */
.settings-popover::-webkit-scrollbar {
  width: 4px;
}
.settings-popover::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 2px;
}

.popover-arrow {
  position: absolute;
  top: -8px;
  right: 25px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--glass-bg);
}

.section {
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}

.section-title {
  font-size: 1rem;
  color: var(--text-color);
  font-weight: bold;
  margin: 0;
  position: relative;
  padding-left: 0.8rem;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 14px;
  background: var(--primary-color);
  border-radius: 2px;
}

.reset-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.reset-btn:hover {
  opacity: 1;
}

.value-badge {
  margin-left: auto;
  font-size: 0.8rem;
  background: rgba(var(--primary-color), 0.1);
  color: var(--primary-color);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

/* 色相滑块 */
.hue-slider-container {
  padding: 0 0.5rem;
}

.hue-slider {
  width: 100%;
  -webkit-appearance: none;
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
  outline: none;
}

.hue-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: #fff;
  border: 2px solid var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
}

/* 网格按钮 */
.grid-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.flex-options {
  display: flex;
  gap: 0.5rem;
}

.flex-1 { flex: 1; }

.option-btn {
  background: rgba(var(--primary-color), 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-color);
  padding: 0.6rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.3s;
}

.option-btn:hover {
  background: rgba(var(--primary-color), 0.1);
}

.option-btn.active {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}

.option-icon {
  font-size: 1rem;
}

/* 开关列表 */
.toggle-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.8rem;
  background: rgba(var(--primary-color), 0.05);
  border-radius: 8px;
  border: 1px solid var(--glass-border);
}

.toggle-label {
  font-size: 0.9rem;
  color: var(--text-color);
}

/* 开关组件 */
.switch-container {
  position: relative;
  width: 40px;
  height: 22px;
}

input[type="checkbox"] {
  display: none;
}

.switch-label {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 11px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.switch-label::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background-color: #fff;
  border-radius: 50%;
  transition: transform 0.3s;
}

input:checked + .switch-label {
  background-color: var(--primary-color);
}

input:checked + .switch-label::after {
  transform: translateX(18px);
}

/* 玻璃效果 */
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(15px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--card-shadow);
}

/* 动画 */
.slide-fade-enter-active { transition: all 0.2s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(-10px) scale(0.95);
  opacity: 0;
}
</style>
