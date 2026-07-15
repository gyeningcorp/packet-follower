import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Professional muted palette per medium
const MEDIUM_IDLE   = { fiber: '#1e3a5f', copper: '#2d2418', wireless: '#2a1f40', unknown: '#1a2030' }
const MEDIUM_ACTIVE = { fiber: '#388bfd', copper: '#d29922',  wireless: '#a371f7', unknown: '#39c5cf' }

export function NetworkLink({ source, target, isActive, link }) {
  const matRef = useRef()
  const medium = link?.medium || 'unknown'

  const points = useMemo(() => [
    new THREE.Vector3(...source.position),
    new THREE.Vector3(...target.position)
  ], [source, target])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points)
    g.computeBoundingSphere()
    return g
  }, [points])

  // Subtle pulse on active fiber link
  useFrame((state) => {
    if (!matRef.current || !isActive || medium !== 'fiber') return
    matRef.current.opacity = 0.75 + Math.sin(state.clock.elapsedTime * 4) * 0.25
  })

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        ref={matRef}
        color={isActive ? MEDIUM_ACTIVE[medium] : MEDIUM_IDLE[medium]}
        transparent
        opacity={isActive ? 0.9 : 0.6}
      />
    </line>
  )
}
