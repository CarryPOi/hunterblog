<template>
  <div class="gallery-wrapper fade-in">
    <!-- 横向滚动容器 -->
    <div 
      class="carousel-container" 
      ref="container" 
      @wheel="onWheel"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
    >
      <div 
        class="photo-card" 
        v-for="(img, index) in images" 
        :key="index"
      >
        <div class="photo-inner">
          <div class="parallax-wrapper">
            <img :src="img" alt="Monster Hunter Photo" loading="lazy" />
          </div>
          
          <div class="photo-info glass">
            <span class="label">RECORD</span>
            <!-- 使用取模运算获取真实的图片序号 -->
            <span class="number">No. {{ String((index % baseImages.length) + 1).padStart(2, '0') }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 操作提示 -->
    <div class="scroll-hint">
      <span class="icon">↔</span>
      <span>滚动鼠标加速，悬浮图片暂停</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import gsap from 'gsap'

const modules = import.meta.glob('@/hunterphoto/*.{png,jpg,jpeg,gif}', { eager: true, import: 'default' })
const baseImages = Object.values(modules)

// 为了实现无缝循环，我们将图片数组重复 4 遍
const images = [...baseImages, ...baseImages, ...baseImages, ...baseImages]

const container = ref(null)
const isHovering = ref(false)
let animationId = null
let originalBodyClass = ''
let originalRippleState = null

// 无缝循环的核心检查逻辑
const checkLoop = () => {
  if (!container.value || baseImages.length === 0) return
  const el = container.value
  
  const groupWidth = el.scrollWidth / 4
  
  if (el.scrollLeft >= groupWidth * 2) {
    el.scrollLeft -= groupWidth
  } 
  else if (el.scrollLeft <= 0) {
    el.scrollLeft += groupWidth
  }
}

// 自动滚动动画循环与视差效果
const autoScroll = () => {
  if (container.value) {
    if (!isHovering.value) {
      container.value.scrollLeft += 1.5 
      checkLoop()
    }
    
    // GSAP 滚动视差逻辑 (Parallax)
    const windowWidth = window.innerWidth
    const cards = container.value.querySelectorAll('.photo-card')
    cards.forEach(card => {
      const rect = card.getBoundingClientRect()
      // 只处理在屏幕可视范围内的卡片
      if (rect.right > 0 && rect.left < windowWidth) {
        // 计算卡片中心与屏幕中心的偏移比例
        const centerOffset = (rect.left + rect.width / 2) - (windowWidth / 2)
        const ratio = centerOffset / windowWidth
        
        const wrapper = card.querySelector('.parallax-wrapper')
        if (wrapper) {
          // 减小偏移量，因为使用 contain 后图片居中，位移太大容易贴边
          gsap.set(wrapper, { x: -ratio * 80 })
        }
      }
    })
  }
  animationId = requestAnimationFrame(autoScroll)
}

// 鼠标滚轮接管
const onWheel = (e) => {
  if (!container.value) return
  
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault() 
    container.value.scrollLeft += e.deltaY * 1.5 
    checkLoop()
  }
}

onMounted(() => {
  // 进入狩影时，强制开启全局透明模式，让大本营壁纸完全透出
  originalBodyClass = document.body.className
  document.body.className = document.body.className.replace(/mode-\w+/g, '').trim()
  document.body.classList.add('mode-transparent')

  // 同时临时关闭全局水波纹特效，以免阻挡底部图片内容
  originalRippleState = localStorage.getItem('wp-ripple')
  localStorage.setItem('wp-ripple', 'false')

  if (baseImages.length === 0) return
  
  nextTick(() => {
    setTimeout(() => {
      if (container.value) {
        const groupWidth = container.value.scrollWidth / 4
        container.value.scrollLeft = groupWidth
      }
      animationId = requestAnimationFrame(autoScroll)
    }, 150)
  })
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  
  // 离开狩影时，恢复之前的壁纸模式
  document.body.className = originalBodyClass
  
  // 恢复之前的水波纹特效设置
  if (originalRippleState !== null) {
    localStorage.setItem('wp-ripple', originalRippleState)
  } else {
    localStorage.removeItem('wp-ripple')
  }
})
</script>

<style scoped>
.gallery-wrapper {
  position: relative;
  width: 100%;
  height: calc(100vh - 80px); 
  /* 移除丑陋的黑色径向渐变背景 */
  background-color: transparent;
  /* 增加全局透明模糊模式，让大本营的壁纸透过来 */
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  overflow: hidden;
}

.carousel-container {
  display: flex;
  width: 100%;
  /* 移除 padding 和 gap，全部使用 margin 确保 scrollWidth 计算能够被完美四等分 */
  padding: 0; 
  overflow-x: auto;
  overflow-y: hidden;
  align-items: center;
  height: 100%;
}

.carousel-container::-webkit-scrollbar {
  display: none;
}
.carousel-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.photo-card {
  flex: 0 0 50vw;
  min-width: 600px;
  max-width: 900px;
  aspect-ratio: 16 / 9;
  position: relative;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  /* 使用 margin-right 替代 gap 使得首尾相接没有宽度误差 */
  margin-right: 3rem; 
}

.photo-card:hover {
  transform: scale(1.02) translateY(-10px);
}

.photo-inner {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0,0,0,0.6);
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0, 0, 0, 0.4); /* 添加半透明底色，使 contain 留白部分好看 */
  cursor: pointer;
}

.parallax-wrapper {
  width: 100%;
  height: 100%;
  will-change: transform;
  display: flex;
  align-items: center;
  justify-content: center;
}

.parallax-wrapper img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* 显示完整的图片 */
  transition: transform 0.5s ease;
}

.photo-card:hover .parallax-wrapper img {
  transform: scale(1.05); 
}

.photo-info {
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  border-radius: 4px;
  border-left: 4px solid #c5a059;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none; 
}

.glass {
  background: rgba(10, 10, 10, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255,255,255,0.1);
  border-right: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
}

.photo-info .label {
  color: #c5a059;
  font-size: 0.8rem;
  letter-spacing: 4px;
  margin-bottom: 2px;
}

.photo-info .number {
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
  font-family: monospace;
}

.scroll-hint {
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  letter-spacing: 2px;
  pointer-events: none;
  animation: pulse 2s infinite;
}

.scroll-hint .icon {
  font-size: 1.2rem;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

.fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
