import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEstate, getItems } from '../lib/supabase'
import { buildRemainingSteps } from '../lib/estateProgress'
import { loadStatusExtras } from '../lib/decisions'
import { proposalForMe } from '../lib/approval'
import { L } from '../lib/lang'
import { Overline } from '../components/UI'

export default function StatusPage({ session }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [estate, setEstate] = useState(null)
  const [items, setItems] = useState([])
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [{ data: est }, { data: its }] = await Promise.all([getEstate(id), getItems(id)])
      const all = its || []
      const [extras, proposal] = await Promise.all([loadStatusExtras(id), proposalForMe(id, session.user.id).catch(() => null)])
      setEstate(est)
      setItems(all)
      setSteps(buildRemainingSteps({ estateId: id, userId: session.user.id, items: all, ...extras, proposal }))
      setLoading(false)
    })()
  }, [id])

  if (loading) return <div style={{ padding:'80px', textAlign:'center', color:'#B9B4A8', fontFamily:'Karla, sans-serif' }}>{L('Laster…', 'Loading…')}</div>

  const assigned = items.filter(i => i.status === 'assigned').length
  const pct = items.length ? Math.round((assigned / items.length) * 100) : 0

  return (
    <div style={{ maxWidth:'560px', margin:'0 auto', padding:'28px 16px 60px', fontFamily:'Karla, sans-serif' }}>
      <button onClick={() => navigate(`/estate/${id}`)} style={{ background:'none', border:'none', color:'#B9B4A8', cursor:'pointer', fontSize:'0.8125rem', padding:'0 0 16px', fontFamily:'Karla, sans-serif' }}>{L('← Tilbake til boet', '← Back to the estate')}</button>
      <Overline>{L('Fordeling', 'Distribution')}</Overline>
      <h1 style={{ fontFamily:"'Bodoni Moda', 'Times New Roman', serif", fontSize:'clamp(1.9rem, 1.3rem + 2.6vw, 3rem)', lineHeight:1.08, letterSpacing:'-0.02em', fontWeight:'400', color:'#F2EEE6', marginBottom:'4px' }}>{L('Hva gjenstår', 'What remains')}</h1>
      {estate?.name && <p style={{ color:'#B9B4A8', fontSize:'0.875rem', marginBottom:'20px' }}>{estate.name}</p>}

      <div style={{ marginBottom:'28px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8125rem', color:'#F2EEE6', marginBottom:'6px' }}>
          <span>{L(`${assigned} av ${items.length} gjenstander tildelt`, `${assigned} of ${items.length} items assigned`)}</span>
          <span>{pct} %</span>
        </div>
        <div style={{ height:'6px', background:'#30342D', borderRadius:'3px', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:'#F2EEE6', borderRadius:'3px' }} />
        </div>
      </div>

      <button onClick={() => navigate(`/estate/${id}/fordeling`)} style={{ width:'100%', marginBottom:'24px', minHeight:'44px', padding:'10px 14px', background:'#272A25', border:'1px solid rgba(242, 238, 230, 0.4)', borderRadius:'10px', cursor:'pointer', color:'#F2EEE6', fontSize:'0.875rem', fontFamily:'Karla, sans-serif', textAlign:'left' }}>
        {L('Se fordelingen – per arving, og utkast som PDF', 'See the distribution – per heir, and a draft as PDF')} →
      </button>

      {steps.length === 0 ? (
        <div style={{ background:'#30342D', border:'1px solid rgba(242, 238, 230, 0.14)', borderRadius:'12px', padding:'24px', textAlign:'center' }}>
          <div style={{ fontFamily:"'Bodoni Moda', 'Times New Roman', serif", fontSize:'1.125rem', color:'#F2EEE6', marginBottom:'4px' }}>{L('Alt er klart', 'All done')}</div>
          <div style={{ fontSize:'0.8125rem', color:'#F2EEE6' }}>{L('Det er ingenting som gjenstår i boet.', 'Nothing remains in the estate.')}</div>
        </div>
      ) : (
        <ol style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'10px' }}>
          {steps.map((step, i) => (
            <li key={step.key} style={{ background:'#272A25', border:'1px solid rgba(242, 238, 230, 0.14)', borderRadius:'12px', padding:'14px 16px', display:'flex', gap:'12px', alignItems:'flex-start' }}>
              <div style={{ width:'24px', height:'24px', borderRadius:'50%', border:'1.5px solid rgba(242, 238, 230, 0.14)', color:'#B9B4A8', fontSize:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i + 1}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'0.875rem', color:'#F2EEE6', fontWeight:'500', lineHeight:1.4 }}>{step.title}</div>
                {step.detail && <div style={{ fontSize:'0.75rem', color:'#B9B4A8', marginTop:'3px', lineHeight:1.5 }}>{step.detail}</div>}
              </div>
              {step.path && (
                <button onClick={() => navigate(step.path)} style={{ flexShrink:0, padding:'6px 12px', background:'none', border:'1px solid rgba(242, 238, 230, 0.14)', borderRadius: '999px', cursor:'pointer', color:'#F2EEE6', fontSize:'0.75rem', fontFamily:'Karla, sans-serif', whiteSpace:'nowrap' }}>
                  {step.pathLabel || L('Åpne', 'Open')} →
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
