<template>
  <canvas ref="canvas" class="fire-spark-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx = null
let animationId = null
let particles = []

const particleCount = 80
const colors = [
  '#ff4d00', // 深橘
  '#ff8800', // 亮橘
  '#ffcc00', // 金黄
  '#ff3300'  // 红色
]

class Particle {
  constructor(width, height) {
    this.reset(width, height, true)
  }

  reset(width, height, initial = false) {
    this.w = width
    this.h = height
    this.x = Math.random() * width
    // 初始分布在全屏，之后从底部产生
    this.y = initial ? Math.random() * height : height + Math.random() * 20
    this.size = Math.random() * 2 + 1
    this.speedX = Math.random() * 2 - 1 // 左右轻微晃动
    this.speedY = -(Math.random() * 2 + 1) // 向上升
    this.opacity = Math.random() * 0.8 + 0.2
    this.life = Math.random() * 100 + 50 // 寿命
    this.color = colors[Math.floor(Math.random() * colors.length)]
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY
    this.life--

    // 向上升的过程中逐渐变小并消失
    if (this.opacity > 0.01) {
      this.opacity -= 0.005
    }

    if (this.life <= 0 || this.y < -10 || this.opacity <= 0) {
      this.reset(this.w, this.h)
    }
  }

  draw() {
    ctx.save()
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.globalAlpha = this.opacity
    
    // 添加发光效果
    ctx.shadowBlur = 10
    ctx.shadowColor = this.color
    
    ctx.fill()
    ctx.restore()
  }
}

const init = () => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d')
  resize()
  particles = Array.from({ length: particleCount }, () => new Particle(canvas.value.width, canvas.value.height))
  animate()
}

const resize = () => {
  if (!canvas.value) return
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
}

const animate = () => {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  particles.forEach(p => {
    p.update()
    p.draw()
  })
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  init()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.fire-spark-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999; /* 确保在最上层 */
}
</style>
