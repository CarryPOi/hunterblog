<template>
  <div class="home-container">
    <!-- 左侧个人信息 -->
    <section class="left-panel">
      <div class="profile-card glass">
        <img src="@/assets/image/头修.jpg" alt="头像" class="avatar" />
        <h2 class="name">Aileakx</h2>
        <p class="subtitle">怪物猎人·爱好者</p>
        <!-- 可自行补充更多个人信息 -->
      </div>

      <MusicPlayer />
    </section>

    <!-- 中间主要内容 -->
    <section class="center-panel">
      <!-- 分类导航 (独立卡片) -->
      <div class="category-card glass">
        <div class="category-nav">
          <div 
            v-for="cat in categories" 
            :key="cat.id"
            :class="['category-item', { active: activeCategory === cat.id }]"
            @click="activeCategory = cat.id"
            :title="cat.name"
          >
            <span v-if="cat.id === 'all'" class="cat-icon">🏠</span>
            <span v-else class="cat-name">{{ cat.name }}</span>
          </div>
        </div>
      </div>

      <!-- 文章列表 (独立卡片) -->
      <div class="posts-container-card glass" :class="{ 'is-expanded': expandedPost }">
        <div class="posts-container">
          <!-- 展开后的详情视图 -->
          <Transition name="fade">
            <div v-if="expandedPost" class="post-detail-view">
              <button class="back-to-list" @click="expandedPost = null">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                返回列表
              </button>
              <h1 class="detail-title">{{ expandedPost.title }}</h1>
              <div class="post-meta">
                <span class="post-date">📅 {{ expandedPost.date }}</span>
                <span class="post-category">🏷️ {{ expandedPost.categoryName }}</span>
              </div>
              <div class="detail-content">
                {{ expandedPost.content }}
                <!-- 这里可以模拟更多内容 -->
                <p v-for="i in 5" :key="i" class="placeholder-text">
                  这是补充的详细内容段落 {{ i }}。在实际应用中，这里会展示完整的文章正文。怪物猎人的世界充满了挑战与惊喜，每一场狩猎都是一段独特的记忆。
                </p>
              </div>
            </div>
          </Transition>

          <!-- 列表视图 -->
          <TransitionGroup v-if="!expandedPost" name="list">
            <article 
              v-for="post in filteredPosts" 
              :key="post.id" 
              class="post-item"
              @click="expandedPost = post"
            >
              <h2 class="post-title">{{ post.title }}</h2>
              <div class="post-meta">
                <span class="post-date">📅 {{ post.date }}</span>
                <span class="post-category">🏷️ {{ post.categoryName }}</span>
              </div>
              <p class="post-excerpt">{{ post.content }}</p>
              <div class="read-more">点击阅读全文 →</div>
            </article>
          </TransitionGroup>
          
          <div v-if="filteredPosts.length === 0 && !expandedPost" class="no-posts">
            <p>暂无相关内容</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 右侧日历表格 -->
    <section class="right-panel">
      <div class="calendar-table glass">
        <div class="calendar-header">
          <button class="nav-btn prev-btn" @click="prevMonth" title="上个月">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <div class="month-wrapper" :class="{ 'has-today': monthOffset !== 0 }">
            <span class="month-label">{{ monthYear }}</span>
            <Transition name="fade">
              <button v-if="monthOffset !== 0" class="nav-btn today-btn" @click="goToday" title="回到本月">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 4v6h-6"></path>
                  <path d="M1 20v-6h6"></path>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </button>
            </Transition>
          </div>

          <button class="nav-btn next-btn" @click="nextMonth" title="下个月">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        <div class="week-header">
          <span v-for="d in weekDays" :key="d" class="week-day">{{ d }}</span>
        </div>
        <div class="calendar-body">
          <div
            v-for="item in calendarDays"
            :key="item.day + '-' + item.empty"
            :class="['day-cell', { today: item.isToday, empty: item.empty }]"
          >{{ item.day }}</div>
        </div>
      </div>

      <!-- 网站数据统计 -->
      <div class="stats-card glass">
        <h3 class="stats-title">全站数据中心</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ postCount }}</span>
            <span class="stat-label">篇记录</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ photoCount }}</span>
            <span class="stat-label">张影像</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ wordCount }}</span>
            <span class="stat-label">字数统计</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MusicPlayer from '@/components/MusicPlayer.vue'
const selianaTheme = import.meta.env.BASE_URL + 'music/成田暁彦 - 前線拠点 セリエナのテーマ.mp3'

const monthOffset = ref(0)               // 0 = 本月，正数为未来，负数为过去
const monthYear = ref('')
const weekDays = ['日','一','二','三','四','五','六']
const calendarDays = ref([]) // 包含空位的格子

// 统计数据计算
const photoModules = import.meta.glob('@/hunterphoto/*.{png,jpg,jpeg,gif}')
const photoCount = ref(Object.keys(photoModules).length)

// 分类数据
const categories = [
  { id: 'all', name: '全部' },
  { id: 'tips', name: '技巧' },
  { id: 'daily', name: '日常' },
  { id: 'article', name: '文章' },
  { id: 'blacklist', name: '挂人' },
  { id: 'flare', name: '信号弹' }
]

const activeCategory = ref('all')
const expandedPost = ref(null)

// 文章数据
const posts = ref([
  { 
    id: 1, 
    title: '太刀见切闪避技巧教学', 
    date: '2026-06-05', 
    category: 'tips', 
    categoryName: '技巧',
    content: '见切斩是太刀的核心防御反击技能，在怪物攻击即将命中的瞬间按下 R2+O...' 
  },
  { 
    id: 2, 
    title: '新大陆的清晨，今天也是狩猎的一天', 
    date: '2026-06-04', 
    category: 'daily', 
    categoryName: '日常',
    content: '今天在星辰基地喝了一杯大桶木桶酒，准备去古代树森林转转。' 
  },
  { 
    id: 3, 
    title: '关于冰原生态系统深度解析', 
    date: '2026-06-03', 
    category: 'article', 
    categoryName: '文章',
    content: '永霜冻土的极端环境造就了独特的食物链，从最底层的波波到顶端的冰咒龙...' 
  },
  { 
    id: 4, 
    title: '遭遇野队恶意炸弹哥', 
    date: '2026-06-02', 
    category: 'blacklist', 
    categoryName: '挂人',
    content: '在狩猎黑龙时，某位猎人全程在旁边放爆弹炸队友，大家注意避雷。' 
  },
  { 
    id: 5, 
    title: '急求！猛碎龙任务求大佬带飞', 
    date: '2026-06-01', 
    category: 'flare', 
    categoryName: '信号弹',
    content: '打了三小时了，每次都在最后阶段翻车，坐标集会所：XXXX-XXXX' 
  }
])

const filteredPosts = computed(() => {
  if (activeCategory.value === 'all') return posts.value
  return posts.value.filter(post => post.category === activeCategory.value)
})

const postCount = computed(() => posts.value.length)
const wordCount = computed(() => {
  return posts.value.reduce((total, post) => total + post.content.length + post.title.length, 0)
})

function generateCalendar() {
  const today = new Date()
  const target = new Date(today.getFullYear(), today.getMonth() + monthOffset.value, 1)
  monthYear.value = `${target.getFullYear()}年${target.getMonth() + 1}月`

  const firstWeekday = target.getDay() // 0 = Sun
  const list = []
  // 前置空位，使首日对齐
  for (let i = 0; i < firstWeekday; i++) {
    list.push({ day: '', empty: true })
  }
  // 生成 1‑30 天（若月份不足 30 天仍固定展示 30 天）
  for (let i = 1; i <= 30; i++) {
    const date = new Date(target.getFullYear(), target.getMonth(), i)
    const isToday =
      monthOffset.value === 0 && i === today.getDate()
    list.push({ day: i, isToday, empty: false })
  }
  calendarDays.value = list
}

function prevMonth() {
  monthOffset.value--
  generateCalendar()
}

function nextMonth() {
  monthOffset.value++
  generateCalendar()
}

function goToday() {
  monthOffset.value = 0
  generateCalendar()
}

onMounted(() => generateCalendar())
</script>

<style scoped>
/* 整体容器使用 Flex，使三列等高、居中 */
.home-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 0;
  gap: 1.5rem;
  width: 85%;
  margin: 0 auto;
  min-height: calc(100vh - 110px); /* 扣除顶部导航高度 */
  font-family: 'Inter', sans-serif;
}

/* 通用玻璃效果 */
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
  color: var(--text-color);
  transition: all 0.4s ease;
}

/* 日历布局（表格） */
.calendar-table {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--title-color);
  margin-bottom: 1rem;
  padding: 0 0.5rem;
  min-height: 45px;
}

.month-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
  position: relative;
}

/* 当刷新按钮出现时，为了保持视觉平衡，标题会稍微向左偏移 */
.month-wrapper.has-today {
  padding-left: 40px; /* 补偿右侧按钮宽度，使标题依然在视觉中心 */
}

.month-label {
  font-size: 1.4rem;
  font-weight: bold;
  white-space: nowrap;
}

.nav-btn {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.today-btn {
  background: rgba(255, 215, 0, 0.1);
  color: #c5a059;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
}

.today-btn:hover {
  background: #c5a059;
  color: #fff;
  box-shadow: 0 4px 12px rgba(197, 160, 89, 0.3);
}

/* 简单的淡入淡出动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.nav-btn, .today-btn {
  background: hsla(var(--theme-hue), 70%, 45%, 0.1);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-color);
  padding: 0.4rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-btn:hover, .today-btn:hover {
  background: var(--primary-color);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--primary-color), 0.3);
}
.nav-btn svg {
  transition: transform 0.3s ease;
}
.nav-btn:hover svg {
  transform: scale(1.1);
}
.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  color: var(--title-color);
  font-weight: 600;
}
.week-day {
  padding: 0.3rem 0;
}
.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.3rem;
}
.day-cell {
  text-align: center;
  padding: 0.6rem 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-color);
  transition: all 0.3s;
}
.day-cell.today {
  background: rgba(255, 215, 0, 0.3);
  border-color: #ffd700;
  font-weight: bold;
}
.day-cell.empty {
  visibility: hidden;
}
.day-number {
  font-size: 1.2rem;
  font-weight: bold;
}
.day-label {
  font-size: 0.85rem;
  opacity: 0.8;
}

/* 全站数据统计卡片 */
.stats-card {
  margin-top: 1.2rem;
  padding: 1.2rem;
  text-align: center;
}
.stats-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: var(--primary-color);
  letter-spacing: 2px;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 0.5rem;
}
.stats-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  transition: transform 0.3s;
}
.stat-item:hover {
  transform: translateY(-3px);
}
.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  font-family: monospace;
  color: var(--title-color);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.left-panel {
  flex: 0 0 20%;
}
.right-panel {
  flex: 0 0 20%;
}
.center-panel {
  flex: 1 1 60%;
}

/* 个人信息卡片 */
.profile-card {
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 0.8rem;
  border: 2px solid var(--glass-border);
}
.name {
  margin: 0;
  font-size: 1.4rem;
  color: var(--title-color);
}
.subtitle {
  margin-top: 0.4rem;
  font-size: 1rem;
  color: var(--text-secondary);
}

/* 中间内容区域布局 */
.center-panel {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.category-card {
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.posts-container-card {
  border-radius: 12px;
  overflow: hidden;
  flex: 1;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.posts-container-card.is-expanded {
  position: relative;
  z-index: 100;
}

/* 分类导航 */
.category-nav {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 0.8rem 1.5rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  padding: 0.6rem 1.4rem;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text-secondary);
  font-weight: 500;
  border: 1px solid var(--glass-border);
  background: transparent;
  font-size: 1.15rem; /* 增大字体 */
}

.category-item:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.category-item.active {
  color: var(--primary-color);
  border-color: var(--primary-color);
  border-width: 1.5px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(var(--primary-color), 0.15);
}

.cat-icon {
  font-size: 1.5rem; /* 增大图标 */
}

.cat-name {
  font-size: 1.15rem;
}

/* 文章列表容器 */
.posts-container {
  padding: 1.5rem;
  height: 100%;
}

.post-item {
  padding: 1.5rem;
  border-bottom: 1px solid var(--glass-border);
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 8px;
}

.post-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.read-more {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--primary-color);
  font-weight: 500;
  opacity: 0.8;
}

/* 详情视图样式 */
.post-detail-view {
  padding: 1rem;
  animation: slideIn 0.4s ease-out;
}

.back-to-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1.5rem;
  font-weight: 600;
  transition: transform 0.2s;
}

.back-to-list:hover {
  transform: translateX(-5px);
}

.detail-title {
  font-size: 2.2rem;
  color: var(--title-color);
  margin-bottom: 1rem;
}

.detail-content {
  margin-top: 2rem;
  line-height: 1.8;
  color: var(--text-color);
  font-size: 1.1rem;
}

.placeholder-text {
  margin-top: 1.5rem;
  opacity: 0.8;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.post-title {
  font-size: 1.6rem;
  margin-bottom: 0.6rem;
  color: var(--title-color);
  font-weight: bold;
}

.post-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.post-excerpt {
  line-height: 1.7;
  color: var(--text-color);
  font-size: 1.05rem;
}

.no-posts {
  text-align: center;
  padding: 4rem 0;
  color: var(--text-secondary);
  font-size: 1.2rem;
}

/* 列表过渡动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* 个人信息卡片 */
.time-card {
  text-align: center;
  padding: 1rem;
}
.time-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: #fff;
}
.time-display {
  font-size: 2rem;
  font-family: 'Inter', sans-serif;
  color: #ffeb3b;
}

/* 响应式 */
@media (max-width: 1024px) {
  .home-container {
    flex-direction: column;
    align-items: stretch;
  }
  .left-panel,
  .right-panel,
  .center-panel {
    flex: unset;
    width: 100%;
  }
  .right-panel {
    margin-top: 1rem;
  }
}

/* 音乐播放器卡片 */
.music-player-card {
  margin-top: 1.5rem;
  text-align: center;
  color: #e8d5a3;
}

.player-section-title {
  font-size: 1.2rem;
  color: #ffd700;
  margin-bottom: 0.8rem;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  padding-bottom: 0.4rem;
  font-weight: 600;
}

.player-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

/* 唱片旋转动效 */
.disc-wrapper {
  margin: 0.5rem 0;
}

.disc {
  width: 75px;
  height: 75px;
  border-radius: 50%;
  background: radial-gradient(circle, #1a1a1a 25%, #3a2a18 26%, #110c06 60%, #c5a059 98%, #ffd700 100%);
  border: 2px solid rgba(255, 215, 0, 0.4);
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
  transition: transform 0.5s ease;
}

.disc-center {
  width: 16px;
  height: 16px;
  background: #0d0a05;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1.5px solid #ffd700;
}

/* 旋转类 */
.rotating {
  animation: rotateDisc 12s linear infinite;
}

@keyframes rotateDisc {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 歌曲名称与作者 */
.song-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.song-title-wrap {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
}

.song-title {
  font-size: 0.95rem;
  color: #fff;
  font-weight: 600;
  display: inline-block;
}

.song-artist {
  font-size: 0.8rem;
  color: #c7b299;
}

/* 播放控件 */
.player-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  width: 100%;
}

.control-btn {
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
  transition: transform 0.2s, opacity 0.2s;
  user-select: none;
}

.control-btn:hover {
  transform: scale(1.15);
}

.play-btn {
  font-size: 1.8rem;
}

.mini-btn {
  font-size: 1.1rem;
  opacity: 0.7;
}

.mini-btn.active {
  opacity: 1;
  filter: drop-shadow(0 0 4px #ffd700);
}

/* 进度条 */
.progress-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.time-label {
  font-size: 0.75rem;
  color: #c7b299;
  width: 32px;
  text-align: center;
}

.progress-bar-wrap {
  flex-grow: 1;
  height: 20px; /* 加高点击热区 */
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
}

.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  position: relative;
}

/* 透明的 range input 叠在视觉进度条上，捕获点击和拖拽 */
.progress-range {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
  padding: 0;
  z-index: 2;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #c5a059, #ffd700);
  border-radius: 3px;
  position: absolute;
  top: 0;
  left: 0;
}

.progress-handle {
  width: 10px;
  height: 10px;
  background: #fff;
  border: 1.5px solid #ffd700;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.6);
}

/* 音量条 */
.volume-container {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  justify-content: center;
  margin-top: 0.2rem;
}

.volume-icon {
  font-size: 0.9rem;
  cursor: pointer;
  opacity: 0.8;
}

.volume-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 60%;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffd700;
  cursor: pointer;
  box-shadow: 0 0 2px rgba(0,0,0,0.5);
}

.volume-slider::-moz-range-thumb {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffd700;
  cursor: pointer;
  box-shadow: 0 0 2px rgba(0,0,0,0.5);
}
</style>
