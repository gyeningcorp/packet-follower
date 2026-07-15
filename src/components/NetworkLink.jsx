import { useMemo } from 'react'
import * as THREE from 'three'

export function NetworkLink({ source, target, isActive }) {
  const points = useMemo(() => [
    new THREE.Vector3(...source.position),
    new THREE.Vector3(...target.position)
  ], [source, target])

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color={isActive ? '#00ffcc' : '#1a3a5c'}
        linewidth={isActive ? 2 : 1}
        transparent
        opacity={isActive ? 1 : 0.5}
      />
    </line>
  )
}
