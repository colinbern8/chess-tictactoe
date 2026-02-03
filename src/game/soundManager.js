let audioContext = null

const getAudioContext = () => {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return null
    audioContext = new AudioContextClass()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

const playTone = ({
  type,
  frequency,
  duration,
  volume,
  frequencyRampTo = null,
  startTime,
}) => {
  const context = getAudioContext()
  if (!context) return
  const now = startTime ?? context.currentTime
  const oscillator = context.createOscillator()
  const gainNode = context.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, now)
  if (frequencyRampTo) {
    oscillator.frequency.exponentialRampToValueAtTime(
      frequencyRampTo,
      now + duration
    )
  }

  gainNode.gain.setValueAtTime(volume, now)
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)

  oscillator.connect(gainNode)
  gainNode.connect(context.destination)

  oscillator.start(now)
  oscillator.stop(now + duration + 0.02)
}

export const playSound = (soundName, isMuted = false) => {
  if (isMuted) return
  try {
    const context = getAudioContext()
    if (!context) return
    const now = context.currentTime

    switch (soundName) {
      case 'click':
        playTone({
          type: 'sine',
          frequency: 440,
          duration: 0.05,
          volume: 0.3,
        })
        break
      case 'place':
        playTone({
          type: 'triangle',
          frequency: 200,
          frequencyRampTo: 100,
          duration: 0.15,
          volume: 0.4,
        })
        break
      case 'move':
        playTone({
          type: 'sine',
          frequency: 330,
          duration: 0.08,
          volume: 0.3,
        })
        break
      case 'capture':
        playTone({
          type: 'sawtooth',
          frequency: 150,
          frequencyRampTo: 50,
          duration: 0.3,
          volume: 0.5,
        })
        break
      case 'win': {
        const notes = [440, 550, 660]
        notes.forEach((frequency, index) => {
          playTone({
            type: 'sine',
            frequency,
            duration: 0.15,
            volume: 0.4,
            startTime: now + index * 0.15,
          })
        })
        break
      }
      case 'draw': {
        const notes = [440, 220]
        notes.forEach((frequency, index) => {
          playTone({
            type: 'sine',
            frequency,
            duration: 0.2,
            volume: 0.3,
            startTime: now + index * 0.2,
          })
        })
        break
      }
      default:
        break
    }
  } catch {
    // Ignore audio playback failures.
  }
}
