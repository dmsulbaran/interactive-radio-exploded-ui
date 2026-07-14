import { Suspense, useState, useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import RadioScene from './RadioScene'
import { useAudioManager } from './hooks/useAudio'

const INSTRUCTIONS = [
  'Haz clic en la perilla para encender la radio',
  'Haz clic de nuevo para sintonizar',
  'Haz clic en el cuerpo de la radio para escuchar la señal',
  null, // Phase 3 — pure 3D interaction
]

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-ring" />
      <p className="loading-text">CARGANDO MODELO · · ·</p>
    </div>
  )
}

export default function App() {
  const [phase, setPhase] = useState(0)
  const [bulletActive, setBulletActive] = useState(false)
  const [instructionKey, setInstructionKey] = useState(0)
  const prevPhase = useRef(0)

  const audio = useAudioManager()

  useEffect(() => {
    if (prevPhase.current !== phase) {
      setInstructionKey((k) => k + 1)
      prevPhase.current = phase
    }
  }, [phase])

  useEffect(() => {
    if (phase === 3) setBulletActive(true)
  }, [phase])

  const handleBulletDone = useCallback(() => {
    setBulletActive(false)
  }, [])

  const instruction = INSTRUCTIONS[phase]

  return (
    <div
      id="app-root"
      style={{ width: '100vw', height: '100vh', position: 'relative', background: '#050505', overflow: 'hidden' }}
    >
      <Canvas
        id="radio-canvas"
        camera={{ position: [0, 0, 3], fov: 45, near: 0.1, far: 1000 }}
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#050505' }}
      >
        <Suspense fallback={null}>
          <RadioScene
            phase={phase}
            setPhase={setPhase}
            audio={audio}
            onBulletDone={handleBulletDone}
          />
        </Suspense>

        {/* OrbitControls enabled fully in phase 3 for total 3D interaction */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={1.5}
          maxDistance={12}
          maxPolarAngle={Math.PI * 0.8}
          minPolarAngle={Math.PI * 0.1}
          enabled={true}
          makeDefault
        />
      </Canvas>

      <Suspense fallback={<LoadingScreen />}>
      </Suspense>

      {instruction && (
        <div key={instructionKey} className="instruction-banner fade-enter" aria-live="polite" role="status">
          <div className="instruction-inner">
            <span className="dot" aria-hidden="true" />
            {instruction}
          </div>
        </div>
      )}

      {/* Minimalist Portfolio Portal Link */}
      <a 
        href="https://dmsulbaran.com" 
        target="_blank" 
        rel="noreferrer" 
        className="portfolio-link-overlay"
      >
        [ Explorar Portafolio Completo → ]
      </a>

      {/* Ambient scanline overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
          zIndex: 5,
        }}
      />

      {/* Vignette */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.75) 100%)',
          zIndex: 5,
        }}
      />
    </div>
  )
}
