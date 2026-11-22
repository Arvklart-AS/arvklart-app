import { useEffect, useRef } from 'react'

const FORDEL_COLORS = ['#DCE3D2','#E8DFD0','#C9AE8E','#A8B598','#8B9A7D','#D9CFC0','#5F6E52','#9C8267']
const getColor = (name = '') => FORDEL_COLORS[name.split('').reduce((a,c)=>a+c.charCodeAt(0),0) % FORDEL_COLORS.length]
const avatarTextColor = (hex) => { if(!hex)return'#F5F2EB'; const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return(0.299*r+0.587*g+0.114*b)/255>0.55?'#1F2326':'#F5F2EB' }

export function Avatar({ name = '?', size = 32, color }) {
  const bg = color || getColor(name)
  const textCol = avatarTextColor(bg)
  return (
    <span title={name} style={{
      width:`${size}px`, height:`${size}px`, borderRadius:'50%',
      background: bg,
      border: textCol === 'rgba(242, 238, 230, 0.4)' ? '1px solid rgba(242, 238, 230, 0.14)' : 'none',
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      fontSize:`${Math.floor(size*0.4)}px`, color: textCol, fontWeight:'500', flexShrink:0,
      fontFamily:'Karla, sans-serif',
    }}>{name[0]?.toUpperCase() || '?'}</span>
  )
}

export function Card({ children, style = {} }) {
  return (
    <div style={{ background:'#272A25', border:'1px solid rgba(242, 238, 230, 0.14)', borderRadius:'12px', ...style }}>
      {children}
    </div>
  )
}

// Liten etikett med en strek foran, over en sideoverskrift (som overlinjene på arvklart.no)
export function Overline({ children }) {
  return (
    <p style={{ display:'flex', alignItems:'center', gap:'0.9em', margin:'0 0 10px', fontFamily:'Karla, sans-serif', fontSize:'0.75rem', fontWeight:600, lineHeight:1.4, letterSpacing:'0.22em', textTransform:'uppercase', color:'#C79A6B' }}>
      <span aria-hidden="true" style={{ flex:'0 0 44px', height:'1px', background:'currentColor', opacity:0.85 }} />
      {children}
    </p>
  )
}

// Dialog med riktig semantikk: role="dialog", Esc lukker, Tab blir i dialogen, og fokus går tilbake
// til knappen som åpnet den. Første knapp får fokus (i bekreftelser er det «Avbryt»).
// labelledBy: id på overskriften i dialogen.
// Panelet er mørkt, som sidene i boet (estateTheme.js). panelStyle: egne farger på panelet.
export function Modal({ onClose, labelledBy, maxWidth = 400, overlay = 'rgba(0,0,0,0.5)', zIndex = 200, panelStyle, children }) {
  const panelRef = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const opener = document.activeElement
    const focusables = () => [...panelRef.current.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])')]
    ;(focusables()[0] || panelRef.current)?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current?.(); return }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (!items.length) return
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (opener && opener !== document.body && opener.isConnected) opener.focus?.()
    }
  }, [])

  return (
    <div onClick={() => closeRef.current?.()} style={{ position:'fixed', inset:0, background:overlay, display:'flex', alignItems:'center', justifyContent:'center', zIndex, padding:'20px' }}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1} onClick={e => e.stopPropagation()}
        style={{ background:'#30342D', color:'#F2EEE6', border:'1px solid rgba(242, 238, 230, 0.14)', borderRadius:'10px', padding:'28px', maxWidth:`${maxWidth}px`, width:'100%', fontFamily:'Karla, sans-serif', maxHeight:'calc(100vh - 40px)', overflowY:'auto', ...panelStyle }}>
        {children}
      </div>
    </div>
  )
}
