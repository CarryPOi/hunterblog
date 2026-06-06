<template>
  <div class="gear-container">
    <!-- 左侧武器选择区块 -->
    <aside class="left-sidebar">
      <div class="filter-card glass">
        <h3 class="filter-title">武器筛选</h3>
        <ul class="weapon-list">
          <li
            :class="['weapon-item', { active: currentFilter === '全部' }]"
            @click="setFilter('全部')"
          >
            <span class="weapon-icon">⚔️</span>
            <span class="weapon-name">全部武器</span>
            <span class="weapon-count">{{ allBuildsCount }}</span>
          </li>
          <li
            v-for="w in weaponTypes"
            :key="w.name"
            :class="['weapon-item', { active: currentFilter === w.name }]"
            @click="setFilter(w.name)"
          >
            <span class="weapon-icon">{{ w.icon }}</span>
            <span class="weapon-name">{{ w.name }}</span>
            <span class="weapon-count">{{ getWeaponCount(w.name) }}</span>
          </li>
        </ul>
      </div>
    </aside>

    <!-- 右侧内容区块 -->
    <main class="right-content">
      <!-- 头部：标题与发布按钮 -->
      <div class="header-section glass">
        <div class="header-info">
          <h1 class="page-title">配装分享工坊</h1>
          <p class="page-subtitle">探索猎人们分享的极佳武器配置，或发布你自己的专属配装！</p>
        </div>
        <button class="toggle-form-btn" @click="showForm = !showForm">
          {{ showForm ? '关闭发布面板' : '+ 分享我的配装' }}
        </button>
      </div>

      <!-- 上传分享配装表单 -->
      <transition name="slide-fade">
        <div v-if="showForm" class="upload-form-card glass">
          <h2 class="form-title">分享新配装</h2>
          <form @submit.prevent="submitBuild" class="build-form">
            <div class="form-grid">
              <div class="form-group">
                <label for="title">配装名称 <span class="required">*</span></label>
                <input
                  id="title"
                  v-model="form.title"
                  type="text"
                  placeholder="例：黑龙大剑破头专用配装"
                  required
                />
              </div>

              <div class="form-group">
                <label for="weapon">武器类型 <span class="required">*</span></label>
                <select id="weapon" v-model="form.weapon" required>
                  <option value="" disabled>选择武器类别</option>
                  <option v-for="w in weaponTypes" :key="w.name" :value="w.name">
                    {{ w.icon }} {{ w.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="description">配装介绍与核心技能 <span class="required">*</span></label>
              <textarea
                id="description"
                v-model="form.description"
                rows="4"
                placeholder="详细说明装备配置、核心技能、护石或操作心得..."
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label>配装效果图 <span class="required">*</span></label>
              <div
                class="upload-dropzone"
                :class="{ 'has-preview': imagePreview }"
                @click="triggerFileInput"
              >
                <input
                  type="file"
                  ref="fileInput"
                  class="hidden-file-input"
                  accept="image/*"
                  @change="onFileChange"
                />
                <div v-if="!imagePreview" class="upload-prompt">
                  <span class="upload-icon">📷</span>
                  <p>点击选择图片进行上传</p>
                  <span class="upload-hint">支持各种主流图片格式，大小不限（将自动压缩保存）</span>
                </div>
                <div v-else class="preview-container">
                  <img :src="imagePreview" alt="预览图" class="image-preview" />
                  <div class="preview-overlay">
                    <span>更换图片</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="resetForm">重置</button>
              <button type="submit" class="submit-btn" :disabled="isSubmitting">
                {{ isSubmitting ? '保存中...' : '发布分享' }}
              </button>
            </div>
          </form>
        </div>
      </transition>

      <!-- 配装展示列表 -->
      <div class="builds-grid">
        <div v-if="filteredBuilds.length === 0" class="no-builds glass">
          <p>当前分类下暂无猎人分享配装。来做第一个分享的人吧！</p>
        </div>
        <div
          v-for="build in filteredBuilds"
          :key="build.id"
          class="build-card glass"
        >
          <div class="card-image-wrapper" @click="openLightbox(build)">
            <img :src="build.image" :alt="build.title" class="card-image" />
            <div class="image-overlay">
              <span>点击查看大图</span>
            </div>
            <span class="weapon-badge">{{ getWeaponIcon(build.weapon) }} {{ build.weapon }}</span>
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ build.title }}</h3>
            <p class="card-desc">{{ build.description }}</p>
            <div class="card-footer">
              <span class="author-tag">👤 猎人分享</span>
              <button class="delete-btn" @click.stop="deleteBuild(build.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 弹窗：大图详情查看 -->
    <transition name="lightbox-fade">
      <div v-if="lightboxBuild" class="lightbox-modal" @click="closeLightbox">
        <div 
          ref="modalRef"
          class="lightbox-content glass" 
          @click.stop 
          @mousedown="onModalMousedown"
          @wheel="onModalWheel"
          :style="{ 
            transform: `translate(${modalX}px, ${modalY}px) scale(${modalScale})`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
            cursor: isDragging ? 'grabbing' : 'grab'
          }"
          :class="{ 'is-dragging': isDragging }"
        >
          <button class="close-modal-btn" @click="closeLightbox" @mousedown.stop>×</button>
          <div class="modal-body">
            <div class="modal-image-col">
              <img 
                :src="lightboxBuild.image" 
                :alt="lightboxBuild.title" 
                class="modal-image" 
                draggable="false"
              />
            </div>
            <div class="modal-info-col">
              <span class="modal-badge">{{ getWeaponIcon(lightboxBuild.weapon) }} {{ lightboxBuild.weapon }}</span>
              <h2 class="modal-title">{{ lightboxBuild.title }}</h2>
              <div class="modal-divider"></div>
              <h4 class="section-title">配装详情与技能指引</h4>
              <p class="modal-description">{{ lightboxBuild.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 导入 14 种武器的图片
import weaponGreatsword from '@/assets/image/weapon/大剑.jpg'
import weaponLongsword from '@/assets/image/weapon/太刀.jpg'
import weaponSwordAndShield from '@/assets/image/weapon/片手剑.jpg'
import weaponDualBlades from '@/assets/image/weapon/双刀.jpg'
import weaponHammer from '@/assets/image/weapon/大锤.jpg'
import weaponHuntingHorn from '@/assets/image/weapon/狩猎笛.jpg'
import weaponLance from '@/assets/image/weapon/长枪.jpg'
import weaponGunlance from '@/assets/image/weapon/铳枪.jpg'
import weaponSwitchAxe from '@/assets/image/weapon/斩斧.jpg'
import weaponChargeBlade from '@/assets/image/weapon/盾斧.jpg'
import weaponInsectGlaive from '@/assets/image/weapon/操虫棍.jpg'
import weaponLightBowgun from '@/assets/image/weapon/轻弩.jpg'
import weaponHeavyBowgun from '@/assets/image/weapon/重弩.jpg'
import weaponBow from '@/assets/image/weapon/弓箭.jpg'

// 14种武器及图标
const weaponTypes = [
  { name: '大剑', icon: '🗡️' },
  { name: '太刀', icon: '⚔️' },
  { name: '片手剑', icon: '🛡️' },
  { name: '双刀', icon: '🔪' },
  { name: '大锤', icon: '🔨' },
  { name: '狩猎笛', icon: '📯' },
  { name: '长枪', icon: '🔱' },
  { name: '铳枪', icon: '⚙️' },
  { name: '斩斧', icon: '🪓' },
  { name: '盾斧', icon: '🛡️' },
  { name: '操虫棍', icon: '🦯' },
  { name: '轻弩', icon: '🔫' },
  { name: '重弩', icon: '💣' },
  { name: '弓箭', icon: '🏹' },
]

// 14种武器初始推荐配装数据
const initialRecommendedBuilds = [
  {
    id: 'rec-greatsword',
    title: '大剑 - 极致物理爆破配装',
    weapon: '大剑',
    description: '核心技能：挑战者7、看破7、超会心3、弱点特效3、集中3、攻击4。这套大剑配装以极致的物理面板伤害和满会心为核心，配合集中3能够快速打出真蓄力斩，是追求单次攻击最高伤害猎人的首选。',
    image: weaponGreatsword,
  },
  {
    id: 'rec-longsword',
    title: '太刀 - 红刃爆伤居合登龙配装',
    weapon: '太刀',
    description: '核心技能：看破7、攻击7、弱点特效3、超会心3、纳刀术3、回避性能3。专为太刀使量身定制，纳刀术3让特殊纳刀速度达到极致，无论是见切还是居合都如丝般顺滑，登龙伤害瞬间拉满。',
    image: weaponLongsword,
  },
  {
    id: 'rec-swordshield',
    title: '片手剑 - 全能全开精准打击配装',
    weapon: '片手剑',
    description: '核心技能：看破7、超会心3、弱点特效3、攻击4、回避性能3、广域化5。片手剑兼顾极高的物理属性混合输出与完美的机动性，广域化5可在组队时提供极佳辅助，完美适配各种复杂狩猎场景。',
    image: weaponSwordAndShield,
  },
  {
    id: 'rec-dualblades',
    title: '双刀 - 极速属性乱舞配装',
    weapon: '双刀',
    description: '核心技能：属性攻击强化6、体术5、超会心3、弱点特效3、真·属性会心、耐力急速回复3。双刀的精髓在于高频的属性伤害，这套配装最大化了属性会心效果，配合滑步和极速连击，提供无间断的高额输出。',
    image: weaponDualBlades,
  },
  {
    id: 'rec-hammer',
    title: '大锤 - 强力KO锤击眩晕配装',
    weapon: '大锤',
    description: '核心技能：KO术5、看破7、超会心3、弱点特效3、集中3、耳塞5。这套大锤配装专为爆头眩晕怪物设计，KO术5提供极高的气绝值加成，耳塞5确保在怪吼时依然能够安心蓄力打出强力的三级大地一击。',
    image: weaponHammer,
  },
  {
    id: 'rec-huntinghorn',
    title: '狩猎笛 - 旋律共鸣团队至尊配装',
    weapon: '狩猎笛',
    description: '核心技能：吹笛名人2、看破7、超会心3、弱点特效3、广域化5、满足感3。作为团队的核心支柱，吹笛名人延长旋律增益时间，广域满足感组合提供无限药水支援，同时具备不俗的物理敲击面板。',
    image: weaponHuntingHorn,
  },
  {
    id: 'rec-lance',
    title: '长枪 - 铁壁防御防守反击配装',
    weapon: '长枪',
    description: '核心技能：防御性能5、防御强化、守势3、超会心3、弱点特效3、看破7。长枪的核心在于完美的防御与不间断的输出，守势3在精准防御时能大幅提升攻击力，是真正的移动要塞。',
    image: weaponLance,
  },
  {
    id: 'rec-gunlance',
    title: '铳枪 - 全弹发射毁灭轰击配装',
    weapon: '铳枪',
    description: '核心技能：炮术5、炮弹装填数UP、回避距离提升3、防御性能5、防御强化、利刃/弹丸节约。以全弹发射为核心输出手段，炮术5和装填数UP将炮击伤害提升到极致，回避距离提升确保了移动的灵活身位。',
    image: weaponGunlance,
  },
  {
    id: 'rec-switchaxe',
    title: '斩斧 - 零距离解放抱脸流配装',
    weapon: '斩斧',
    description: '核心技能：精灵加护5、强化持续3、整备5、超会心3、弱点特效3、耳塞1。利用高等级的整备和精灵加护，确保衣装的高流转率，开启剑刃强化后不断使用零距离解放突刺粘附怪物头部爆破，输出极高。',
    image: weaponSwitchAxe,
  },
  {
    id: 'rec-chargeblade',
    title: '盾斧 - 超高输出超解流配装',
    weapon: '盾斧',
    description: '核心技能：炮术5、集中3、防性3、守势3、增弹、看破7。专为超高输出属性解放斩设计，集中3能快速攒瓶，瓶子爆炸伤害不吃肉质，配合红盾防御大解，瞬间造成毁灭伤害。',
    image: weaponChargeBlade,
  },
  {
    id: 'rec-insectglaive',
    title: '操虫棍 - 飞天舞者三灯霸体配装',
    weapon: '操虫棍',
    description: '核心技能：看破7、超会心3、弱点特效3、飞燕、回避性能3、体术3。利用飞燕技能强化空中招式伤害，配合操虫三灯状态的霸体与动作值提升，在怪物头顶自由穿梭起舞，观赏性与输出拉满。',
    image: weaponInsectGlaive,
  },
  {
    id: 'rec-lightbowgun',
    title: '轻弩 - 极速属性速射游走配装',
    weapon: '轻弩',
    description: '核心技能：属性攻击强化6、装填扩充3、利刃/弹丸节约、属性会心、看破7、回避距离2。以属性弹速射为主要输出方式，超高的射速与利刃节约配合，能够在极短时间内倾泻弹药，游走输出安全高效。',
    image: weaponLightBowgun,
  },
  {
    id: 'rec-heavybowgun',
    title: '重弩 - 散弹轰击贴脸盾防配装',
    weapon: '重弩',
    description: '核心技能：散弹强化2、装填扩充3、防御性能5、守势3、超会心3、弱点特效3。重弩搭配盾牌配件和散弹，近距离就如同手持高威力霰弹枪，防性5确保防御无伤，近身输出伤害爆炸。',
    image: weaponHeavyBowgun,
  },
  {
    id: 'rec-bow',
    title: '弓箭 - 真属性会心滑步输出配装',
    weapon: '弓箭',
    description: '核心技能：看破7、属性会心、体术5、耐力急速回复3、强弹珠、贯通珠。利用滑步维持弓箭蓄力等级，不断射出高属性伤害的箭矢，是追求极限DPS猎人的完美选择。',
    image: weaponBow,
  },
]

// 状态变量
const currentFilter = ref('全部')
const showForm = ref(false)
const isSubmitting = ref(false)
const fileInput = ref(null)
const imagePreview = ref('')
const lightboxBuild = ref(null)

const form = ref({
  title: '',
  weapon: '',
  description: '',
  image: '',
})

const builds = ref([])


// 新增弹窗缩放与拖拽状态
const modalRef = ref(null)
const modalX = ref(0)
const modalY = ref(0)
const modalScale = ref(1)
const isDragging = ref(false)

let startX = 0
let startY = 0
let initialModalX = 0
let initialModalY = 0
// 用于高频更新的非响应式变量
let currentModalX = 0
let currentModalY = 0
let animationFrameId = null

function onModalMousedown(e) {
  if (['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
  isDragging.value = true
  startX = e.clientX
  startY = e.clientY
  initialModalX = modalX.value
  initialModalY = modalY.value
  currentModalX = modalX.value
  currentModalY = modalY.value
  
  document.addEventListener('mousemove', onModalMousemove, { passive: true })
  document.addEventListener('mouseup', onModalMouseup)
}

function updateTransform() {
  if (modalRef.value) {
    modalRef.value.style.transform = `translate(${currentModalX}px, ${currentModalY}px) scale(${modalScale.value})`
  }
  animationFrameId = null
}

function onModalMousemove(e) {
  if (!isDragging.value) return
  currentModalX = initialModalX + (e.clientX - startX)
  currentModalY = initialModalY + (e.clientY - startY)
  
  // 使用 requestAnimationFrame 优化渲染，绕过 Vue 响应式的高频更新
  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(updateTransform)
  }
}

function onModalMouseup() {
  isDragging.value = false
  // 将非响应式的最终位置同步回响应式变量，以免状态丢失
  modalX.value = currentModalX
  modalY.value = currentModalY
  document.removeEventListener('mousemove', onModalMousemove)
  document.removeEventListener('mouseup', onModalMouseup)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

function onModalWheel(event) {
  if (event.target.closest('.modal-info-col')) {
    return // 允许文字区正常滚动
  }
  event.preventDefault()
  const delta = event.deltaY
  if (delta < 0) {
    modalScale.value = Math.min(modalScale.value + 0.1, 4)
  } else {
    modalScale.value = Math.max(modalScale.value - 0.1, 0.3)
  }
  if (modalRef.value) {
    modalRef.value.style.transform = `translate(${currentModalX || modalX.value}px, ${currentModalY || modalY.value}px) scale(${modalScale.value})`
  }
}

function closeLightbox() {
  modalScale.value = 1
  modalX.value = 0
  modalY.value = 0
  currentModalX = 0
  currentModalY = 0
  lightboxBuild.value = null
}

onMounted(() => {
  const stored = localStorage.getItem('mh_gear_builds')
  if (stored) {
    try {
      let parsed = JSON.parse(stored)
      // 过滤掉旧的默认 mock 数据以及任何可能残留的旧推荐数据，以最新 recommendations 为准
      parsed = parsed.filter(b => !b.id.startsWith('mock-') && !b.id.startsWith('rec-'))
      // 将 14 种武器的初始推荐配装排在最前面，其后是用户自己保存的自定义配装
      builds.value = [...initialRecommendedBuilds, ...parsed]
      saveToStorage()
    } catch (e) {
      console.error('Failed to parse stored builds, resetting to default:', e)
      builds.value = [...initialRecommendedBuilds]
      saveToStorage()
    }
  } else {
    // 预载 14 种武器推荐配装
    builds.value = [...initialRecommendedBuilds]
    saveToStorage()
  }
})

// 计算属性
const filteredBuilds = computed(() => {
  if (currentFilter.value === '全部') {
    return builds.value
  }
  return builds.value.filter((b) => b.weapon === currentFilter.value)
})

const allBuildsCount = computed(() => builds.value.length)

// 方法
function getWeaponCount(name) {
  return builds.value.filter((b) => b.weapon === name).length
}

function getWeaponIcon(name) {
  const found = weaponTypes.find((w) => w.name === name)
  return found ? found.icon : '⚔️'
}

function setFilter(name) {
  currentFilter.value = name
}

function triggerFileInput() {
  fileInput.value.click()
}

// 图片选择及压缩逻辑
function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    const img = new Image()
    img.onload = () => {
      // 缩放并压缩图片，防止 localStorage 溢出
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height
      const maxSize = 800

      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // 转换为 jpeg 格式并降画质到 0.7
      const compressed = canvas.toDataURL('image/jpeg', 0.7)
      imagePreview.value = compressed
      form.value.image = compressed
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(file)
}

function submitBuild() {
  if (!form.value.title || !form.value.weapon || !form.value.description || !form.value.image) {
    alert('请填写所有带 * 的必填项并上传效果图！')
    return
  }

  isSubmitting.value = true

  const newBuild = {
    id: 'build-' + Date.now(),
    title: form.value.title,
    weapon: form.value.weapon,
    description: form.value.description,
    image: form.value.image,
  }

  // 添加到前面
  builds.value.unshift(newBuild)
  saveToStorage()
  resetForm()
  showForm.value = false
  isSubmitting.value = false
}

function deleteBuild(id) {
  if (confirm('确定要删除这套配装分享吗？')) {
    builds.value = builds.value.filter((b) => b.id !== id)
    saveToStorage()
  }
}

function resetForm() {
  form.value = {
    title: '',
    weapon: '',
    description: '',
    image: '',
  }
  imagePreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function saveToStorage() {
  localStorage.setItem('mh_gear_builds', JSON.stringify(builds.value))
}

function openLightbox(build) {
  lightboxBuild.value = build
}


</script>

<style scoped>
/* 容器布局 */
.gear-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 0;
  gap: 2rem;
  width: 85%;
  margin: 0 auto;
  min-height: calc(100vh - 70px);
  font-family: 'Inter', sans-serif;
  color: var(--text-color);
  transition: color 0.4s ease;
}

/* 左侧栏 */
.left-sidebar {
  flex: 0 0 25%;
  position: sticky;
  top: 90px;
}

.filter-card {
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

/* 自定义滚动条 */
.filter-card::-webkit-scrollbar {
  width: 6px;
}
.filter-card::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 4px;
}

.filter-title {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--glass-border);
  padding-bottom: 0.5rem;
  color: var(--title-color);
  text-align: center;
}

.weapon-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.weapon-item {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-color);
}

.weapon-item:hover {
  background: rgba(255, 215, 0, 0.15);
  transform: translateX(5px);
}

.weapon-item.active {
  background: rgba(204, 81, 81, 0.25);
  border-left: 4px solid #ff4444;
  color: var(--title-color);
}

.weapon-icon {
  font-size: 1.2rem;
  margin-right: 0.8rem;
}

.weapon-name {
  flex-grow: 1;
  font-size: 1.1rem;
  font-weight: 500;
}

.weapon-count {
  font-size: 0.9rem;
  background: var(--glass-border);
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
  color: var(--title-color);
}

/* 右侧内容 */
.right-content {
  flex: 1 1 75%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 通用玻璃效果 */
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
  transition: background-color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease, transform 0.4s ease;
}

/* 拖拽时为了保证流畅度，暂时关闭耗性能的模糊和阴影 */
.is-dragging {
  backdrop-filter: none !important;
  box-shadow: none !important;
  transition: none !important;
}

/* 头部样式 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.8rem;
  color: #fff;
  margin-bottom: 0.3rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.page-subtitle {
  font-size: 1rem;
  color: #c7b299;
}

.toggle-form-btn {
  background: linear-gradient(135deg, #c5a059, #8f6f37);
  border: 1px solid rgba(255,215,0,0.4);
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.toggle-form-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 215, 0, 0.25);
  background: linear-gradient(135deg, #d8b46a, #a28143);
}

/* 表单样式 */
.upload-form-card {
  animation: slideDown 0.3s ease-out;
}

.form-title {
  font-size: 1.4rem;
  color: #ffd700;
  margin-bottom: 1rem;
  border-left: 4px solid #ffd700;
  padding-left: 0.5rem;
}

.build-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
}

.required {
  color: #ff4444;
}

.form-group input[type="text"],
.form-group select,
.form-group textarea {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  padding: 0.6rem;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input[type="text"]:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #ffd700;
  outline: none;
}

/* 上传区 */
.upload-dropzone {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  background: rgba(0,0,0,0.2);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-dropzone:hover {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.05);
}

.hidden-file-input {
  display: none;
}

.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  display: block;
}

.upload-hint {
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.4rem;
  display: block;
}

.preview-container {
  width: 100%;
  max-height: 250px;
  overflow: hidden;
  border-radius: 6px;
}

.image-preview {
  width: 100%;
  height: auto;
  max-height: 250px;
  object-fit: contain;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #fff;
  transition: opacity 0.3s;
}

.upload-dropzone:hover .preview-overlay {
  opacity: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.5rem;
}

.cancel-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.cancel-btn:hover {
  background: rgba(255,255,255,0.2);
}

.submit-btn {
  background: #ff4444;
  border: none;
  color: #fff;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background 0.3s;
}

.submit-btn:hover {
  background: #ff2222;
}

.submit-btn:disabled {
  background: #555;
  cursor: not-allowed;
}

/* 卡片列表 */
.builds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.no-builds {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #c7b299;
  font-size: 1.2rem;
}

.build-card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s ease, border-color 0.4s ease;
  height: 100%;
}

.build-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.5);
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  cursor: pointer;
  background: #000;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.build-card:hover .card-image {
  transform: scale(1.08);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.95rem;
  transition: opacity 0.3s;
}

.card-image-wrapper:hover .image-overlay {
  opacity: 1;
}

.weapon-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(15, 15, 15, 0.85);
  border: 1px solid rgba(255, 215, 0, 0.4);
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  color: #ffd700;
  font-size: 0.85rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.card-content {
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 0.8rem;
}

.card-title {
  font-size: 1.2rem;
  color: #fff;
  margin: 0;
}

.card-desc {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #c7b299;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 0.8rem;
  margin-top: auto;
}

.author-tag {
  font-size: 0.85rem;
  color: #888;
}

.delete-btn {
  background: none;
  border: none;
  color: #ff4444;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  transition: background 0.3s;
}

.delete-btn:hover {
  background: rgba(255, 68, 68, 0.15);
}

/* 大图 Modal 弹窗 */
.lightbox-modal {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 10, 0.95); /* 加深背景颜色，替代耗性能的模糊 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}

.lightbox-content {
  position: relative;
  width: 95%;
  max-width: 1500px;
  max-height: 90vh;
  padding: 3rem;
  overflow-y: auto;
  border: 1px solid rgba(255, 215, 0, 0.35);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5); /* 减小阴影半径，提升性能 */
  will-change: transform;
  backdrop-filter: none !important; /* 强制移除内层模糊，防止卡顿 */
  background: rgba(20, 20, 20, 0.9); /* 给个实一点的深色底 */
}

.close-modal-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #aaa;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
  transition: color 0.3s;
}

.close-modal-btn:hover {
  color: #ff4444;
}

.modal-body {
  display: flex;
  gap: 2rem;
}

.modal-image-col {
  flex: 0 0 55%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-image {
  width: 100%;
  height: auto;
  max-height: 80vh;
  object-fit: contain;
  transform-origin: center center;
}

.modal-info-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-badge {
  align-self: flex-start;
  background: rgba(255, 215, 0, 0.15);
  border: 1px solid #ffd700;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  color: #ffd700;
  font-weight: 600;
  font-size: 0.9rem;
}

.modal-title {
  font-size: 1.8rem;
  color: #fff;
  margin: 0;
}

.modal-divider {
  height: 1px;
  background: rgba(255,255,255,0.15);
}

.section-title {
  font-size: 1.1rem;
  color: #ffd700;
  margin: 0;
}

.modal-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #e8d5a3;
  white-space: pre-wrap;
}

/* 动效优化 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Modal 淡入淡出 */
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 1024px) {
  .gear-container {
    flex-direction: column;
    width: 95%;
  }

  .left-sidebar {
    flex: unset;
    width: 100%;
    position: relative;
    top: 0;
    margin-bottom: 1rem;
  }

  .filter-card {
    max-height: 200px;
  }

  .weapon-list {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .weapon-item {
    flex: 1 0 30%;
    justify-content: center;
  }

  .right-content {
    flex: unset;
    width: 100%;
  }

  .modal-body {
    flex-direction: column;
  }

  .modal-image-col {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .weapon-item {
    flex: 1 0 45%;
  }

  .header-section {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .lightbox-content {
    width: 90%;
    padding: 1rem;
  }
}
</style>
