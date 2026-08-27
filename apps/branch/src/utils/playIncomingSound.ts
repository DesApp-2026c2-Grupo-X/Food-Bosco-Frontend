let audio: HTMLAudioElement | null = null

const release = () => {
  if (!audio) return
  audio.pause()
  audio.removeAttribute('src')
  audio.load()
  audio = null
}

const ensureAudio = () => {
  if (!audio) {
    audio = new Audio('/incomingOrder.mp3')
    audio.preload = 'auto'
    audio.addEventListener('ended', release)
  }
  return audio
}

export const unlockAudio = () => {
  const el = ensureAudio()
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

export const playIncomingSound = () => {
  const el = ensureAudio()
  el.currentTime = 0
  void el.play().catch(() => {})
}

export const stopIncomingSound = () => {
  release()
}
