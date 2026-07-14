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
  const [showLink, setShowLink] = useState(false) // Interruptor del enlace
  const prevPhase = useRef(0)

  const audio = useAudioManager()

  // Monitoreo de fase en consola
  console.log("Fase actual en tiempo real:", phase)

  useEffect(() => {
    if (prevPhase.current !== phase) {
      setInstructionKey((k) => k + 1)
      prevPhase.current = phase
    }
  }, [phase])

  // 2. Segundo useEffect (Controla la explosión y el retraso del enlace)
  useEffect(() => {
    // Si la fase llegó a 3 (o superior), disparamos el reloj de inmediato
    if (phase >= 3) {
      setBulletActive(true)

      console.log("¡Fase 3 detectada! Iniciando reloj de 15 segundos...");

      const timer = setTimeout(() => {
        console.log("¡Tiempo cumplido! Mostrando enlace...");
        setShowLink(true)
      }, 15000) // 15 segundos exactos

      return () => clearTimeout(timer)
    } else {
      // Si reinicias o estás al principio, se mantiene oculto
      setShowLink(false)
    }
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

      <Suspense fallback={<LoadingScreen />} />

      {instruction && (
        <div key={instructionKey} className="instruction-banner fade-enter" aria-live="polite" role="status">
          <div className="instruction-inner">
            <span className="dot" aria-hidden="true" />
            {instruction}
          </div>
        </div>
      )}

      {/* ENLACE AL PORTAFOLIO: Versión Blindada Anti-Errores */}
      <a
        href="https://dmsulbaran.github.io/fullstack-portfolio/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          fontFamily: 'monospace',
          fontSize: '15px',
          fontWeight: 'bold',
          color: '#34d399', // Verde esmeralda brillante
          backgroundColor: '#0a0a0a', // Fondo negro sólido para cortar el Canvas 3D
          padding: '12px 20px',
          borderRadius: '6px',
          border: '2px solid #34d399', // Borde verde bien marcado
          boxShadow: '0 0 15px rgba(52, 211, 153, 0.4)', // Resplandor neón
          zIndex: 9999999, // Prioridad absoluta en la pantalla
          cursor: 'pointer',
          display: 'block', // Forzamos el renderizado
          textDecoration: 'none'
        }}
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