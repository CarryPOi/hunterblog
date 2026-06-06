<template>
  <div class="music-player-card glass">
    <h3 class="player-section-title">🎵 猎人留声机</h3>
    <div class="player-body">
      <div class="disc-wrapper">
        <div class="disc" :class="{ rotating: isPlaying }">
          <div class="disc-center"></div>
        </div>
      </div>
      <div class="song-info">
        <div class="song-title-wrap">
          <span class="song-title">{{ songTitle }}</span>
        </div>
        <span class="song-artist">{{ songArtist }}</span>
      </div>
      <div class="player-controls">
        <button class="control-btn mini-btn" :class="{ active: isLoop }" @click="toggleLoop" title="单曲循环">🔁</button>
        <button class="control-btn play-btn" @click="togglePlay">{{ isPlaying ? '⏸️' : '▶️' }}</button>
        <button class="control-btn mini-btn" @click="toggleMute" title="静音/取消静音">{{ isMuted || volume === 0 ? '🔇' : '🔊' }}</button>
      </div>
      <div class="progress-container">
        <span class="time-label">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar-wrap">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
            <div class="progress-handle" :style="{ left: progressPercent + '%' }"></div>
          </div>
          <input
            type="range"
            min="0"
            :max="duration || 100"
            step="0.1"
            :value="currentTime"
            @input="handleSeek"
            class="progress-range"
          />
        </div>
        <span class="time-label">{{ formatTime(duration) }}</span>
      </div>
      <div class="volume-container">
        <span class="volume-icon" @click="toggleMute">{{ isMuted || volume === 0 ? '🔇' : '🔊' }}</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          v-model="volume"
          class="volume-slider"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { musicState, togglePlay, toggleLoop, toggleMute, changeVolume, seekTo } from '@/store/musicStore'

const isPlaying = computed(() => musicState.isPlaying)
const currentTime = computed(() => musicState.currentTime)
const duration = computed(() => musicState.duration)
const volume = computed({
  get: () => musicState.volume,
  set: (val) => changeVolume(val)
})
const isMuted = computed(() => musicState.isMuted)
const isLoop = computed(() => musicState.isLoop)
const songTitle = computed(() => musicState.songTitle)
const songArtist = computed(() => musicState.songArtist)

const progressPercent = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === Infinity) return '00:00'
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function handleSeek(e) {
  seekTo(parseFloat(e.target.value))
}

function handleVolume(e) {
  changeVolume(parseFloat(e.target.value))
}
</script>

<style scoped>
.music-player-card {
  margin-top: 1.5rem;
  text-align: center;
  color: var(--text-color);
  transition: all 0.4s ease;
}
.player-section-title {
  font-size: 1.2rem;
  color: var(--title-color);
  margin-bottom: 0.8rem;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 0.4rem;
  font-weight: 600;
}
.player-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}
.disc-wrapper {
  margin: 0.5rem 0;
}
.disc {
  width: 75px;
  height: 75px;
  border-radius: 50%;
  background: radial-gradient(circle, #1a1a1a 25%, #3a2a18 26%, #110c06 60%, #c5a059 98%, #ffd700 100%);
  border: 2px solid var(--glass-border);
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
  transition: transform 0.5s ease;
}
.rotating { animation: rotateDisc 12s linear infinite; }
@keyframes rotateDisc { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.song-info { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }
.song-title { font-size: 0.95rem; color: var(--text-color); font-weight: 600; }
.song-artist { font-size: 0.8rem; color: var(--text-secondary); }
.player-controls { display: flex; justify-content: center; align-items: center; gap: 1.2rem; width: 100%; }
.control-btn { background: none; border: none; cursor: pointer; outline: none; transition: transform 0.2s, opacity 0.2s; user-select: none; }
.control-btn:hover { transform: scale(1.15); }
.play-btn { font-size: 1.8rem; }
.mini-btn { font-size: 1.1rem; opacity: 0.7; }
.mini-btn.active { opacity: 1; filter: drop-shadow(0 0 4px var(--title-color)); }
.progress-container { display: flex; align-items: center; gap: 0.5rem; width: 100%; }
.time-label { font-size: 0.75rem; color: var(--text-secondary); width: 32px; text-align: center; }
.progress-bar-wrap { flex-grow: 1; height: 20px; cursor: pointer; position: relative; display: flex; align-items: center; }
.progress-bar-bg { width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; position: relative; }
.progress-bar-fill { height: 100%; background: linear-gradient(90deg, #c5a059, #ffd700); border-radius: 3px; position: absolute; top: 0; left: 0; }
.progress-handle { width: 10px; height: 10px; background: #fff; border: 1.5px solid #ffd700; border-radius: 50%; position: absolute; top: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 4px rgba(0,0,0,0.6); }
.progress-range { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; margin: 0; padding: 0; z-index: 2; }
.volume-container { display: flex; align-items: center; gap: 0.4rem; width: 100%; justify-content: center; margin-top: 0.2rem; }
.volume-icon { font-size: 0.9rem; cursor: pointer; opacity: 0.8; }
.volume-slider { -webkit-appearance: none; appearance: none; width: 60%; height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px; outline: none; cursor: pointer; }
.volume-slider::-webkit-slider-thumb, .volume-slider::-moz-range-thumb { width: 8px; height: 8px; border-radius: 50%; background: #ffd700; cursor: pointer; box-shadow: 0 0 2px rgba(0,0,0,0.5); }
</style>
