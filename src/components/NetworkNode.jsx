import { useState } from 'react'
import { Html, Text, Billboard } from '@react-three/drei'
import { DEVICE_COLORS, getDeviceIcon } from './DeviceIcon.jsx'

export function NetworkNode({ node, isActive, isVisited }) {
  const [hovered, setHovered] = useState(false)
  const color = DEVICE_COLORS[node.type] || '#8b949e'
  const iconSvg = getDeviceIcon(node.type, isActive ? color : isVisited ? color : '#484f58')

  const scale = isActive ? 1.2 : hovered ? 1.08 : 1

  return (
    <group position={node.position}>
      {/* Subtle selection ring on active node */}
      {isActive && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.018, 8, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} />
        </mesh>
      )}

      {/* Device icon */}
      <Html center distanceFactor={10} zIndexRange={[0, 10]}>
        <div
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          style={{
            width: 48, height: 48,
            transform: `scale(${scale})`,
            transition: 'transform 0.12s ease',
            filter: isActive
              ? `drop-shadow(0 0 5px ${color}99)`
              : isVisited
              ? `drop-shadow(0 0 3px ${color}44)`
              : 'none',
            opacity: isActive ? 1 : isVisited ? 0.85 : 0.5,
            cursor: 'pointer',
          }}
          dangerouslySetInnerHTML={{ __html: iconSvg }}
        />
      </Html>

      {/* Labels */}
      <Billboard follow>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.18}
          color={isActive ? '#e6edf3' : isVisited ? '#8b949e' : '#484f58'}
          anchorX="center" anchorY="bottom"
          outlineWidth={0.015} outlineColor="#0d1117"
          font={undefined}
        >
          {node.label}
        </Text>
        <Text
          position={[0, 0.58, 0]}
          fontSize={0.13}
          color={isActive ? '#388bfd' : isVisited ? '#30363d' : '#21262d'}
          anchorX="center" anchorY="bottom"
          outlineWidth={0.01} outlineColor="#0d1117"
        >
          {node.ip}
        </Text>
      </Billboard>
    </group>
  )
}
