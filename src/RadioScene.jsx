import { useRef, useEffect, useCallback } from 'react'
import { useFrame, createPortal } from '@react-three/fiber'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import * as THREE from 'three'
import BulletFX from './components/BulletFX'
import ChromeOverlay from './components/ChromeOverlay'

const MESH_PATTERNS = {
  knob:       /knob|tuning_knob|perilla|dial|knop/i,
  needle:     /needle|indicator|aguja|pointer/i,
  tuningBar:  /tuning_bar|bar|barra|yellow|freq/i,
  antenna:    /antenna|antena/i,
  pcb:        /pcb|circuit|board|electronic/i,
  flashlight: /flashlight|torch|led|lamp|light/i,
  chassis:    /chassis|body|carcasa|shell|case|housing/i,
}

function findMesh(scene, pattern) {
  let found = null
  scene.traverse((obj) => {
    if (obj.isMesh && !found && pattern.test(obj.name)) found = obj
  })
  return found
}

function getAllMeshes(scene) {
  const meshes = []
  scene.traverse((obj) => { if (obj.isMesh) meshes.push(obj) })
  return meshes.sort((a, b) => a.position.y - b.position.y)
}

const tealGlowMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#00ffd5'),
  emissive: new THREE.Color('#00ffd5'),
  emissiveIntensity: 2.5,
  toneMapped: false,
})

export default function RadioScene({ phase, setPhase, audio, onBulletDone }) {
  const groupRef = useRef()
  const meshRefs = useRef({})
  const explodeT = useRef(0)
  const explodeDone = useRef(false)
  const bulletFired = useRef(false)
  const originalPositions = useRef([])

  const tuningBarRef = useRef()

  const { scene, animations, nodes } = useGLTF('/scene.gltf')
  const { actions, names } = useAnimations(animations, groupRef)

  useEffect(() => {
    if (!scene || !nodes) return
    const refs = meshRefs.current

    refs.knob       = nodes.Object_52 || findMesh(scene, MESH_PATTERNS.knob)
    refs.needle     = nodes.Object_40 || findMesh(scene, MESH_PATTERNS.needle)
    refs.tuningBar  = nodes.Object_48 || findMesh(scene, MESH_PATTERNS.tuningBar)
    refs.antenna    = nodes.Object_16 || findMesh(scene, MESH_PATTERNS.antenna)
    refs.pcb        = nodes.Object_12 || findMesh(scene, MESH_PATTERNS.pcb)
    refs.flashlight = nodes.Object_34 || findMesh(scene, MESH_PATTERNS.flashlight)
    refs.chassis    = nodes.Object_4  || findMesh(scene, MESH_PATTERNS.chassis)
    refs.allMeshes  = getAllMeshes(scene)

    tuningBarRef.current = refs.tuningBar

    // Store original material so we can turn off the glow in Phase 3
    if (refs.tuningBar) {
      refs.tuningBarOriginalMat = refs.tuningBar.material
    }

    originalPositions.current = refs.allMeshes.map((m) => ({
      mesh: m,
      y: m.position.y,
    }))

    if (refs.chassis) {
      refs.chassis.material = refs.chassis.material.clone()
      refs.chassis.material.transparent = true
      refs.chassis.material.opacity = 1
    }
  }, [scene, nodes])

  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return
    Object.values(actions).forEach((action) => {
      if (action) {
        action.reset()
        action.play()
        action.paused = true
      }
    })
  }, [actions])

  useEffect(() => {
    if (phase === 2 && actions) {
      const clipName = names?.[0]
      if (clipName && actions[clipName]) {
        actions[clipName].paused = false
        actions[clipName].setLoop(THREE.LoopRepeat, Infinity)
        actions[clipName].play()
      } else {
        Object.values(actions).forEach((a) => { if (a) a.paused = false })
      }
    }
  }, [phase, actions, names])

  // Power indicator material logic
  useEffect(() => {
    const bar = meshRefs.current.tuningBar
    if (!bar) return
    
    if (phase === 2) {
      bar.material = tealGlowMat
    } else if (phase === 3 && meshRefs.current.tuningBarOriginalMat) {
      // Power cut: return to dead/dark yellow plastic
      bar.material = meshRefs.current.tuningBarOriginalMat
    }
  }, [phase])

  useEffect(() => {
    if (phase === 3) {
      if (actions) {
        Object.values(actions).forEach((a) => { if (a) a.stop() })
      }
      explodeT.current = 0
      explodeDone.current = false
      bulletFired.current = true
    }
  }, [phase, actions])

  const targetVec = useRef(new THREE.Vector3())

  useFrame(({ clock }, delta) => {
    const refs = meshRefs.current

    if (phase === 1 && refs.needle) {
      refs.needle.rotation.z = Math.sin(clock.elapsedTime * 20) * 0.28
    }

    if (phase === 2 && refs.needle) {
      refs.needle.rotation.z = Math.sin(clock.elapsedTime * 3) * 0.04
    }

    if (phase === 3 && !explodeDone.current) {
      explodeT.current = THREE.MathUtils.lerp(explodeT.current, 1.02, delta * 0.65)
      const t = Math.min(explodeT.current, 1)

      const positions = originalPositions.current
      const count = positions.length
      positions.forEach(({ mesh, y }, i) => {
        const normalized = (i / (count - 1)) - 0.5
        let offset = normalized * 0.15

        if (mesh === refs.flashlight) offset = 0.1
        else if (mesh === refs.pcb) offset = -0.08
        else if (mesh === refs.antenna) offset = 0.15

        const targetY = y + offset * t
        targetVec.current.set(mesh.position.x, targetY, mesh.position.z)
        mesh.position.lerp(targetVec.current, delta * 3)
      })

      if (refs.chassis && refs.chassis.material) {
        refs.chassis.material.opacity = THREE.MathUtils.lerp(refs.chassis.material.opacity, 0, delta * 2.5)
      }

      if (t >= 0.9 && !explodeDone.current) {
        explodeDone.current = true
        audio.guia.play()
      }
    }
  })

  const handleSceneClick = useCallback((e) => {
    e.stopPropagation()
    const clickedMesh = e.object
    const refs = meshRefs.current
    const isKnob = clickedMesh === refs.knob || clickedMesh.name === 'Object_52'

    if (phase === 0 && isKnob) {
      audio.estatica.play()
      setPhase(1)
    } else if (phase === 1 && isKnob) {
      audio.estatica.stop()
      audio.intro.play()
      setPhase(2)
    } else if (phase === 2) {
      audio.intro.stop()
      audio.disparo.play()
      setPhase(3)
    }
  }, [phase, setPhase, audio])

  return (
    <group ref={groupRef}>
      {/* ── Pro Studio Lighting System ── */}
      <ambientLight intensity={1.2} />
      <spotLight position={[0, 10, 0]} intensity={3.5} angle={0.6} penumbra={0.5} castShadow />
      <directionalLight position={[0, 2, -6]} intensity={2.5} color="#ffffff" castShadow />
      <directionalLight position={[0, 1, 3]} intensity={2.8} color="#ffffff" />
      
      {phase >= 2 && phase < 3 && (
        <pointLight position={[0, 0, 1.5]} intensity={2.5} color="#00ffd5" distance={5} decay={2} />
      )}

      {/* ── The radio model ── */}
      <group scale={5.5}>
        <primitive
          object={scene}
          onClick={handleSceneClick}
          onPointerOver={(e) => { 
            const isKnob = e.object === meshRefs.current.knob || e.object.name === 'Object_52'
            if ((phase < 2 && isKnob) || phase === 2) {
              document.body.style.cursor = 'pointer'
            }
          }}
          onPointerOut={() => { document.body.style.cursor = 'default' }}
        />

        {/* ── Tuning bar marquee overlay (State 2) with Physical Occlusion ── */}
        {phase === 2 && tuningBarRef.current && createPortal(
          <Html
            occlude="blending"
            position={[0, 0, 0.05]} 
            transform
            scale={0.01}
            style={{ 
              width: '594px', 
              height: '46px', 
              overflow: 'hidden', 
              pointerEvents: 'none',
              background: '#00ffd5'
            }}
          >
            <div className="marquee-track" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '28px', color: '#050505' }}>JAVASCRIPT • REACT • NODE.JS • POSTGRESQL • MONGO&nbsp;&nbsp;&nbsp;JAVASCRIPT • REACT • NODE.JS • POSTGRESQL • MONGO</span>
            </div>
          </Html>,
          tuningBarRef.current
        )}
      </group>

      {/* Chrome Branding Overlay */}
      <ChromeOverlay />

      {/* ── Bullet FX (State 3) ── */}
      {phase === 3 && bulletFired.current && (
        <BulletFX onComplete={onBulletDone} />
      )}
    </group>
  )
}

useGLTF.preload('/scene.gltf')
