<template>
  <Transition name="slide-fade">
    <div v-if="isOpen" class="links-popover glass" v-click-outside="close">
      <div class="popover-arrow"></div>

      <div class="section">
        <div class="section-header">
          <h3 class="section-title">相关链接</h3>
        </div>
        <div class="links-list">
          <a v-for="link in links" :key="link.name" :href="link.url" target="_blank" class="link-item">
            <span class="link-icon">{{ link.icon }}</span>
            <span class="link-name">{{ link.name }}</span>
            <span class="link-arrow">↗</span>
          </a>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const links = [
  { name: 'GitHub', url: 'https://github.com/CarryPOi', icon: '🐈‍⬛' },
  { name: 'bilibili', url: 'https://b23.tv/TpMbc4e', icon: '📺' },
  { name: '猎人工坊', url: 'https://mhdatalab.com/world', icon: '⚒️' },
  { name: '怪物猎人世界', url: 'https://www.monsterhunter.com/world/cn/', icon: '🌍' },
  { name: '踩蘑菇', url: 'https://www.caimogu.cc/search.html?kw=%E6%80%AA%E7%89%A9%E7%8C%8E%E4%BA%BA%E4%B8%96%E7%95%8Cmod', icon: '🍄' },
  { name: 'nexusmods', url: 'https://www.nexusmods.com/games/monsterhunterworld', icon: '🧩' },
]

const close = () => {
  if (props.isOpen) emit('close')
}

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
.links-popover {
  position: absolute;
  top: calc(100% + 15px);
  left: 50%;
  transform: translateX(-50%);
  width: 240px;
  padding: 1.2rem;
  z-index: 3000;
  max-height: 80vh;
  overflow-y: auto;
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform-style: preserve-3d;
}

/* 隐形桥接区域，防止鼠标滑过间隙时触发 leave */
.links-popover::before {
  content: '';
  position: absolute;
  top: -15px;
  left: 0;
  right: 0;
  height: 15px;
  background: transparent;
}

.links-popover::-webkit-scrollbar {
  width: 4px;
}
.links-popover::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 2px;
}

.popover-arrow {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--glass-bg);
}

.section {
  margin-bottom: 0.5rem;
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

.links-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.link-item {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.8rem;
  background: rgba(var(--primary-color), 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-color);
  transition: all 0.3s;
}

.link-item:hover {
  background: rgba(var(--primary-color), 0.15);
  transform: translateX(4px);
  border-color: var(--primary-color);
}

.link-icon {
  margin-right: 0.6rem;
  font-size: 1.2rem;
}

.link-name {
  font-size: 0.95rem;
  font-weight: 500;
  flex: 1;
}

.link-arrow {
  font-size: 0.8rem;
  opacity: 0.5;
  transition: opacity 0.3s, transform 0.3s;
}

.link-item:hover .link-arrow {
  opacity: 1;
  color: var(--primary-color);
  transform: translate(2px, -2px);
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--card-shadow);
}

.slide-fade-enter-active { transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-fade-leave-active { transition: transform 0.2s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s cubic-bezier(0.4, 0, 1, 1); }
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateX(-50%) translateY(-8px) scale(0.97);
  opacity: 0;
}
</style>
