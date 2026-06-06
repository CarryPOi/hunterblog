<template>
  <nav class="topbar">
    <img src="@/assets/hero.png" alt="Logo" class="logo" />
    <ul class="nav-list">
      <li v-for="item in navItems" :key="item.name" class="nav-item">
        <template v-if="item.path === '/settings'">
          <div class="settings-wrapper">
            <a href="javascript:void(0)" class="nav-link" @click.stop="isSettingsOpen = !isSettingsOpen; isLinksOpen = false">
              <span class="nav-icon">{{ item.icon }}</span>
              {{ item.name }}
            </a>
            <SettingsPopover :isOpen="isSettingsOpen" @close="isSettingsOpen = false" />
          </div>
        </template>
        <template v-else-if="item.path === '/links'">
          <div class="settings-wrapper" @mouseenter="isLinksOpen = true" @mouseleave="isLinksOpen = false">
            <a href="javascript:void(0)" class="nav-link" @click.prevent>
              <span class="nav-icon">{{ item.icon }}</span>
              {{ item.name }}
              <span class="nav-arrow" :class="{ 'open': isLinksOpen }">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
              </span>
            </a>
            <LinksPopover :isOpen="isLinksOpen" @close="isLinksOpen = false" />
          </div>
        </template>
        <router-link v-else :to="item.path" class="nav-link">
          <span class="nav-icon">{{ item.icon }}</span>
          {{ item.name }}
        </router-link>
      </li>
    </ul>

    <!-- Mini Music Player -->
    <div class="sidebar-music">
      <div class="mini-disc" :class="{ rotating: musicState.isPlaying }"></div>
      <div class="mini-info" v-if="musicState.isPlaying">
        <span class="mini-song">{{ musicState.songTitle }}</span>
      </div>
      <button class="mini-play-btn" @click="togglePlay" :title="musicState.isPlaying ? '暂停' : '播放'">
        {{ musicState.isPlaying ? '⏸️' : '▶️' }}
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import SettingsPopover from './SettingsPopover.vue'
import LinksPopover from './LinksPopover.vue'
import { musicState, togglePlay } from '@/store/musicStore'

const isSettingsOpen = ref(false)
const isLinksOpen = ref(false)

const navItems = ref([
  { name: '首页',      path: '/',           icon: '🏠' },
  { name: '配装',      path: '/gear',       icon: '⚔️' },
  { name: '时间轴',    path: '/timeline',   icon: '📜' },
  { name: '名片',      path: '/guildcard',  icon: '🪪' },
  { name: '狩影',      path: '/photography',icon: '📷' },
  { name: '链接',      path: '/links',      icon: '🔗' },
  { name: '设置',      path: '/settings',   icon: '⚙️' },
])
</script>

<style scoped>
.topbar {
  position: fixed;
  top: 0;
  left: 50%;
  width: 85%;
  height: 100px;
  transform: translateX(-50%);
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 0 0 12px 12px;
  padding: 0 1rem;
  border: 1px solid var(--glass-border);
  border-top: none;
  transition: all 0.4s ease;
}
.logo {
  height: 48px;
  margin-right: 0.8rem;
}
.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  justify-content: center;
}
.nav-item {
  margin: 0 1rem;
}
.settings-wrapper {
  position: relative;
}
.nav-link {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.8rem;
  color: var(--nav-text);
  text-decoration: none;
  font-weight: 500;
  font-size: 1.3rem;
  transition: background 0.2s, color 0.2s;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}
.nav-icon {
  margin-right: 0.4rem;
  font-size: 1.2rem;
}
.nav-link:hover,
.router-link-active {
  color: var(--nav-hover);               /* 水色文字 */
}

.nav-link::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(204, 81, 81, 0.15); /* 水色透明玻璃 */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 11px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.nav-link:hover::after,
.router-link-active::after {
  opacity: 1;
}

.nav-arrow {
  display: inline-flex;
  align-items: center;
  margin-left: 0.4rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-arrow.open {
  transform: rotate(180deg);
}

/* 侧边栏迷你音乐播放器 */
.sidebar-music {
  position: absolute;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  transition: all 0.3s;
}

.sidebar-music:hover {
  background: rgba(255, 255, 255, 0.1);
}

.mini-disc {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(circle, #1a1a1a 25%, #3a2a18 26%, #110c06 60%, #c5a059 98%, #ffd700 100%);
  border: 1.5px solid var(--glass-border);
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
}

.mini-disc::after {
  content: '';
  width: 6px;
  height: 6px;
  background: #0d0a05;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid #ffd700;
}

.rotating {
  animation: rotateDisc 8s linear infinite;
}

@keyframes rotateDisc {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.mini-info {
  max-width: 120px;
  overflow: hidden;
  white-space: nowrap;
}

.mini-song {
  font-size: 0.85rem;
  color: var(--text-color);
  display: inline-block;
  animation: marquee 10s linear infinite;
}

@keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

.mini-play-btn {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.mini-play-btn:hover {
  transform: scale(1.15);
}
</style>
