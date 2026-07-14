import { useRef, useEffect, useCallback } from 'react'
import { Howl } from 'howler'

/**
 * useAudio — manages a single Howl instance by src path.
 * Returns { play, stop, isPlaying }
 * The Howl is lazily created on first use and cleaned up on unmount.
 */
export function useAudio(src, options = {}) {
  const howlRef = useRef(null)
  const playIdRef = useRef(null)

  // Build Howl lazily
  const getHowl = useCallback(() => {
    if (!howlRef.current) {
      howlRef.current = new Howl({
        src: [src],
        loop: options.loop ?? false,
        volume: options.volume ?? 1,
        preload: true,
      })
    }
    return howlRef.current
  }, [src, options.loop, options.volume])

  const play = useCallback(() => {
    const h = getHowl()
    if (!h.playing()) {
      playIdRef.current = h.play()
    }
  }, [getHowl])

  const stop = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.stop()
    }
  }, [])

  const isPlaying = useCallback(() => {
    return howlRef.current ? howlRef.current.playing() : false
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (howlRef.current) {
        howlRef.current.stop()
        howlRef.current.unload()
        howlRef.current = null
      }
    }
  }, [])

  return { play, stop, isPlaying }
}

/**
 * useAudioManager — manages all four audio files for the radio experience.
 * Returns individual { play, stop } handles keyed by name.
 */
export function useAudioManager() {
  const estatica  = useAudio('/estatica.mp3',    { loop: true,  volume: 0.75 })
  const intro     = useAudio('/intro_david.mp3', { loop: false, volume: 1.0  })
  const disparo   = useAudio('/disparo.mp3',     { loop: false, volume: 0.9  })
  const guia      = useAudio('/guia_ia.mp3',     { loop: false, volume: 1.0  })

  return { estatica, intro, disparo, guia }
}
