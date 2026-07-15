// SVG device icons rendered as HTML overlays in 3D space

export const DEVICE_SVGS = {
  switch: (color = '#00cc88') => `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="16" width="40" height="16" rx="3" fill="#0a1828" stroke="${color}" stroke-width="1.5"/>
      <rect x="4" y="22" width="40" height="4" fill="${color}22"/>
      ${[8,13,18,23,28,33,38].map(x => `<rect x="${x}" y="20" width="3" height="8" rx="1" fill="${color}"/>`).join('')}
      <circle cx="40" cy="19" r="2" fill="${color}"/>
      <line x1="4" y1="13" x2="44" y2="13" stroke="${color}44" stroke-width="1"/>
    </svg>`,

  router: (color = '#ff9900') => `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="24" rx="18" ry="12" fill="#0a1828" stroke="${color}" stroke-width="1.5"/>
      <ellipse cx="24" cy="20" rx="18" ry="6" fill="${color}11" stroke="${color}44" stroke-width="1"/>
      <line x1="12" y1="10" x2="12" y2="4" stroke="${color}" stroke-width="1.5"/>
      <line x1="24" y1="8" x2="24" y2="2" stroke="${color}" stroke-width="1.5"/>
      <line x1="36" y1="10" x2="36" y2="4" stroke="${color}" stroke-width="1.5"/>
      <circle cx="12" cy="4" r="2" fill="${color}"/>
      <circle cx="24" cy="2" r="2" fill="${color}"/>
      <circle cx="36" cy="4" r="2" fill="${color}"/>
      <ellipse cx="24" cy="24" rx="6" ry="4" fill="${color}33"/>
    </svg>`,

  firewall: (color = '#ff4444') => `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="36" height="32" rx="2" fill="#0a1828" stroke="${color}" stroke-width="1.5"/>
      ${[12,18,24,30].map(y => `<rect x="6" y="${y}" width="36" height="4" fill="${color}11" stroke="${color}22" stroke-width="0.5"/>`).join('')}
      ${[14,20,26,32].map((y,i) => [10,16,22,28,34].map(x => `<rect x="${x}" y="${y-3}" width="4" height="3" rx="0.5" fill="${['#ff4444','#ff8800','#ff4444','#ff8800'][i]}44"/>`).join('')).join('')}
      <path d="M20 36 Q24 28 28 36" stroke="${color}" stroke-width="1.5" fill="none"/>
      <circle cx="24" cy="26" r="3" fill="${color}44" stroke="${color}" stroke-width="1"/>
    </svg>`,

  endpoint: (color = '#00aaff') => `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="32" height="24" rx="2" fill="#0a1828" stroke="${color}" stroke-width="1.5"/>
      <rect x="10" y="10" width="28" height="20" rx="1" fill="${color}11"/>
      <rect x="18" y="32" width="12" height="4" fill="#0a1828" stroke="${color}44" stroke-width="1"/>
      <rect x="14" y="36" width="20" height="3" rx="1" fill="#0a1828" stroke="${color}" stroke-width="1"/>
      <rect x="12" y="12" width="24" height="2" rx="1" fill="${color}44"/>
      <rect x="12" y="16" width="16" height="2" rx="1" fill="${color}22"/>
    </svg>`,

  server: (color = '#00aaff') => `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="6" width="28" height="10" rx="2" fill="#0a1828" stroke="${color}" stroke-width="1.5"/>
      <rect x="10" y="19" width="28" height="10" rx="2" fill="#0a1828" stroke="${color}" stroke-width="1.5"/>
      <rect x="10" y="32" width="28" height="10" rx="2" fill="#0a1828" stroke="${color}" stroke-width="1.5"/>
      ${[9,22,35].map(y => `<circle cx="33" cy="${y+3}" r="2" fill="${color}"/><rect x="14" y="${y+2}" width="12" height="2" rx="1" fill="${color}33"/>`).join('')}
    </svg>`,

  wireless: (color = '#aa88ff') => `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="28" r="4" fill="${color}" />
      <path d="M14 20 Q24 12 34 20" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M9 15 Q24 4 39 15" stroke="${color}66" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <line x1="24" y1="32" x2="24" y2="42" stroke="${color}" stroke-width="2"/>
      <line x1="18" y1="42" x2="30" y2="42" stroke="${color}" stroke-width="2"/>
    </svg>`,

  unknown: (color = '#667788') => `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="32" height="32" rx="4" fill="#0a1828" stroke="${color}" stroke-width="1.5"/>
      <text x="24" y="30" text-anchor="middle" font-size="18" fill="${color}" font-family="monospace">?</text>
    </svg>`,
}

export const DEVICE_COLORS = {
  switch:   '#00cc88',
  router:   '#ff9900',
  firewall: '#ff4444',
  endpoint: '#00aaff',
  server:   '#00aaff',
  wireless: '#aa88ff',
  unknown:  '#667788',
}

export function getDeviceIcon(type, color) {
  const fn = DEVICE_SVGS[type] || DEVICE_SVGS.unknown
  return fn(color || DEVICE_COLORS[type] || '#667788')
}
