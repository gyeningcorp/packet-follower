import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useStore } from '../store/index.js'
import * as THREE from 'three'

const _target = new THREE.Vector3()
const _camPos = new THREE.Vector3()
const _lookAt = new THREE.Vector3()

export function FollowCamera({ topology }) {
  const { camera } = useThree()
  const { trace, traceStep, tracing, mode } = useStore()
  const prevNodeRef = useRef(null)

  useFrame((state, delta) => {
    if (mode !== 'follow' || !tracing || !trace) return

    const hop = trace.hops[traceStep]
    if (!hop) return

    const node = topology?.nodes?.find(n => n.id === hop.nodeId)
    if (!node) return

    _target.set(...node.position)

    // Camera offset: slightly behind and above the orb, looking forward
    const nextHop = trace.hops[Math.min(traceStep + 1, trace.hops.length - 1)]
    const nextNode = topology?.nodes?.find(n => n.id === nextHop?.nodeId)
    const nextPos = nextNode ? new THREE.Vector3(...nextNode.position) : _target.clone().add(new THREE.Vector3(2, 0, 0))

    const dir = new THREE.Vector3().subVectors(nextPos, _target).normalize()
    _camPos.copy(_target).addScaledVector(dir, -2.5).add(new THREE.Vector3(0, 1.2, 2))
    _lookAt.copy(_target).add(new THREE.Vector3(0, 0.3, 0))

    camera.position.lerp(_camPos, delta * 2.5)
    camera.lookAt(_lookAt)
  })

  return null
}
