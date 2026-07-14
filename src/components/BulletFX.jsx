import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * BulletFX — renders a small elongated capsule that streaks from left to right
 * at very high speed. Calls onComplete() when it exits the view frustum.
 */
export default function BulletFX({ onComplete }) {
  const groupRef   = useRef()
  const trailRef   = useRef()
  const spawnedAt  = useRef(Date.now())
  const done       = useRef(false)

  // Bullet material — hot tungsten
  const bulletMat = useRef(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ffd580'),
      emissive: new THREE.Color('#ff9900'),
      emissiveIntensity: 3.5,
      metalness: 0.9,
      roughness: 0.1,
      toneMapped: false,
    })
  )

  // Trail material
  const trailMat = useRef(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ff6600'),
      emissive: new THREE.Color('#ff4400'),
      emissiveIntensity: 2,
      transparent: true,
      opacity: 0.45,
      toneMapped: false,
    })
  )

  useEffect(() => {
    // Place bullet at hard left
    if (groupRef.current) {
      groupRef.current.position.set(-5, 0.05, 0.8)
    }
  }, [])

  useFrame((_, delta) => {
    if (done.current) return
    const g = groupRef.current
    if (!g) return

    // Very high velocity — 24 units/sec
    g.position.x += delta * 24

    // Slight wobble on y
    g.position.y += Math.sin(Date.now() * 0.04) * 0.0008

    // Fade trail as bullet leaves
    if (trailRef.current) {
      trailRef.current.material.opacity = Math.max(0, 0.45 - g.position.x * 0.05)
    }

    // Exit condition
    if (g.position.x > 5.5 && !done.current) {
      done.current = true
      onComplete?.()
    }
  })

  return (
    <group ref={groupRef}>
      {/* Core bullet body */}
      <mesh ref={null} rotation={[0, 0, Math.PI / 2]} material={bulletMat.current}>
        <capsuleGeometry args={[0.012, 0.08, 4, 8]} />
      </mesh>

      {/* Glowing trail streak */}
      <mesh
        ref={trailRef}
        position={[-0.25, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={trailMat.current}
      >
        <cylinderGeometry args={[0.005, 0.001, 0.6, 6]} />
      </mesh>

      {/* Point light for warmth */}
      <pointLight color="#ff8800" intensity={4} distance={0.6} decay={2} />
    </group>
  )
}
