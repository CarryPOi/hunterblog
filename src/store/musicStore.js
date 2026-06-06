import { reactive, ref } from 'vue'

export const audioRef = ref(null)

export const musicState = reactive({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.35,
  isMuted: false,
  isLoop: false,
  songTitle: '前線拠点 セリエナのテーマ',
  songArtist: '成田暁彦'
})

export function togglePlay() {
  if (!audioRef.value) return
  if (audioRef.value.paused) {
    audioRef.value.play().catch(err => console.warn('Audio play interrupted:', err))
  } else {
    audioRef.value.pause()
  }
}

export function toggleLoop() {
  musicState.isLoop = !musicState.isLoop
}

export function toggleMute() {
  musicState.isMuted = !musicState.isMuted
  if (audioRef.value) audioRef.value.muted = musicState.isMuted
}

export function changeVolume(newVolume) {
  musicState.volume = newVolume
  if (audioRef.value) audioRef.value.volume = newVolume
  musicState.isMuted = parseFloat(newVolume) === 0
}

export function seekTo(newTime) {
  if (!audioRef.value) return
  audioRef.value.currentTime = newTime
  musicState.currentTime = newTime
  if (audioRef.value.paused) {
    audioRef.value.play().catch(err => console.warn(err))
  }
}
