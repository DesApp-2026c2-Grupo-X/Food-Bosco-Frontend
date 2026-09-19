const DEFAULT_SOUND_URL = '/incomingOrder.mp3'

let audio: HTMLAudioElement | null = null
let currentSrc: string | null = null
let pendingRetry = false

const release = () => {
  if (!audio) return
  audio.pause()
  audio.removeAttribute('src')
  audio.load()
  audio = null
  currentSrc = null
}

const ensureAudio = (url: string) => {
  if (!audio || currentSrc !== url) {
    release()
    audio = new Audio(url)
    audio.preload = 'auto'
    audio.addEventListener('ended', release)
    currentSrc = url
  }
  return audio
}

const retryOnGesture = () => {
  if (!audio || !pendingRetry) return
  pendingRetry = false
  audio.currentTime = 0
  void audio.play().catch(() => {})
}

const queueRetryOnNextGesture = () => {
  if (pendingRetry) return
  pendingRetry = true
  window.addEventListener('pointerdown', retryOnGesture, { once: true })
  window.addEventListener('keydown', retryOnGesture, { once: true })
}

export const unlockAudio = (url: string = DEFAULT_SOUND_URL) => {
  const el = ensureAudio(url)
  el.muted = true
  void el
    .play()
    .then(() => {
      el.pause()
      el.currentTime = 0
      el.muted = false
    })
    .catch(() => {})
}

export const playIncomingSound = (url: string = DEFAULT_SOUND_URL) => {
  const el = ensureAudio(url)
  el.currentTime = 0
  void el.play().catch(() => {
    queueRetryOnNextGesture()
  })
}

export const stopIncomingSound = () => {
  release()
}
