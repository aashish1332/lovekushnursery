import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

/* ── Abstract floating shapes — premium, not cartoon ─── */
function AbstractSphere({ position, color, size, speed }: {
  position: [number, number, number]
  color: string
  size: number
  speed: number
}) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime * speed
    ref.current.position.y = position[1] + Math.sin(t) * 0.3
    ref.current.rotation.x = t * 0.2
    ref.current.rotation.z = t * 0.15
    state.invalidate()
  })

  return (
    <Float speed={speed * 0.5} floatIntensity={0.4} rotationIntensity={0.2}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[size, 1]} />
        <meshStandardMaterial
          color={color}
          roughness={0.15}
          metalness={0.8}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>
    </Float>
  )
}

function AbstractTorus({ position, color, size, speed }: {
  position: [number, number, number]
  color: string
  size: number
  speed: number
}) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime * speed
    ref.current.rotation.x = t * 0.3
    ref.current.rotation.y = t * 0.2
    state.invalidate()
  })

  return (
    <Float speed={speed * 0.3} floatIntensity={0.5} rotationIntensity={0.3}>
      <mesh ref={ref} position={position}>
        <torusGeometry args={[size, size * 0.25, 6, 16]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.7}
          transparent
          opacity={0.25}
        />
      </mesh>
    </Float>
  )
}

function GlowingOrb({ position, color, size }: {
  position: [number, number, number]
  color: string
  size: number
}) {
  return (
    <Float speed={1} floatIntensity={0.6} rotationIntensity={0}>
      <mesh position={position}>
        <sphereGeometry args={[size, 12, 12]} />
        <meshStandardMaterial
          color={color}
          roughness={0.1}
          metalness={0.9}
          emissive={color}
          emissiveIntensity={0.15}
          transparent
          opacity={0.5}
        />
      </mesh>
    </Float>
  )
}

/* ── Scene — minimal, elegant, performant ────────────── */
function Scene() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.1
    state.invalidate()
  })

  return (
    <group ref={groupRef}>
      {/* Lighting — soft, warm, directional */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} color="#fff8ee" />
      <pointLight position={[-4, 3, 2]} intensity={0.2} color="#c4a265" />
      <pointLight position={[3, -2, -3]} intensity={0.15} color="#95b59e" />

      {/* Abstract wireframe shapes — scattered across the viewport */}
      <AbstractSphere position={[-3.5, 1.5, -2]} color="#c4a265" size={0.6} speed={0.4} />
      <AbstractSphere position={[3, -1, -3]} color="#95b59e" size={0.4} speed={0.6} />
      <AbstractSphere position={[-2, -2, -1.5]} color="#e8b4b8" size={0.3} speed={0.5} />
      <AbstractSphere position={[4, 2, -4]} color="#c4a265" size={0.5} speed={0.35} />

      <AbstractTorus position={[2.5, 1.5, -2]} color="#95b59e" size={0.5} speed={0.3} />
      <AbstractTorus position={[-4, -0.5, -3]} color="#c4a265" size={0.4} speed={0.4} />
      <AbstractTorus position={[0, 3, -4]} color="#e8b4b8" size={0.35} speed={0.25} />

      <GlowingOrb position={[-1.5, 2, -1]} color="#c4a265" size={0.08} />
      <GlowingOrb position={[2, -2, -1]} color="#95b59e" size={0.06} />
      <GlowingOrb position={[0, 0.5, -2]} color="#e8b4b8" size={0.05} />
      <GlowingOrb position={[-3, 0, -2.5]} color="#c4a265" size={0.04} />
      <GlowingOrb position={[3.5, 0.5, -3]} color="#95b59e" size={0.07} />

      {/* Gold sparkle particles */}
      <Sparkles count={30} scale={15} size={1} speed={0.2} color="#c4a265" opacity={0.3} />
    </group>
  )
}

/* ── Export — lightweight, no post-processing ─────────── */
export default function Scene3D() {
  return (
    <div className="canvas-wrapper">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.25]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        frameloop="demand"
      >
        <Scene />
      </Canvas>
    </div>
  )
}
