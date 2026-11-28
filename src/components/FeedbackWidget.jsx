import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { L } from '../lib/lang'

export default function FeedbackWidget({ session, onToast }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('bug')
  const [content, setContent] = useState('')
  const [nps, setNps] = useState(null)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const send = async () => {
    if (!content.trim() && nps === null) return
    setSending(true)
    const { error } = await supabase.from('feedback').insert({
      user_id: session?.user?.id || null,
      type, content: content.trim(), nps_score: nps,
    })
    setSending(false)
    if (error) { onToast?.(L('Kunne ikke sende tilbakemeldingen. Prøv igjen.', 'Could not send your feedback. Please try again.'), 'error'); return }
    setSent(true)
    setTimeout(() => { setOpen(false); setSent(false); setContent(''); setNps(null) }, 2000)
  }

  return (
    <>
      {/* På smale skjermer ville knappen dekket faste lagreknapper nederst (.bottom-bar) */}
      <style>{`@media (max-width: 720px) { body:has(.bottom-bar) .fb-launch { display: none; } }`}</style>
      <button className="fb-launch" onClick={() => setOpen(true)} style={{
        position: 'fixed', bottom: '16px', right: '16px', zIndex: 9999,
        background: '#24392A', color: '#F4F2EB', border: 'none',
        borderRadius: '20px', boxShadow: '0 2px 8px rgba(16, 37, 26, 0.052)',
        padding: '7px 12px', cursor: 'pointer',
        fontSize: '0.8125rem', fontFamily: 'Karla, sans-serif',
      }}>💬</button>

      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(42, 29, 20, 0.16)',
          zIndex: 10000, display: 'flex', alignItems: 'flex-end',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FCFCF9', borderRadius: '16px 16px 0 0',
            padding: '24px', width: '100%',
            boxShadow: '0 -8px 32px rgba(16, 37, 26, 0.052)',
            fontFamily: 'Karla, sans-serif',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '2.25rem', marginBottom: '10px' }}>🙏</div>
                <div style={{ fontSize: '1rem', color: '#2A1D14' }}>{L('Takk!', 'Thank you!')}</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontFamily: "'Bodoni Moda', 'Times New Roman', serif", fontSize: '1.125rem', fontWeight: '400', color: '#2A1D14' }}>{L('Tilbakemelding', 'Feedback')}</h3>
                  <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#4F463A', cursor: 'pointer' }}>×</button>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                  {[['bug',L('🐛 Feil','🐛 Bug')],['idea',L('💡 Idé','💡 Idea')],['general',L('💬 Generelt','💬 General')]].map(([id,label]) => (
                    <button key={id} onClick={() => setType(id)} style={{
                      flex: 1, padding: '8px 4px',
                      border: `2px solid ${type===id?'#2F573E':'rgba(42, 29, 20, 0.14)'}`,
                      borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem',
                      background: type===id?'#24392A':'#FCFCF9',
                      color: type===id?'#F4F2EB':'#2A1D14',
                      fontFamily: 'Karla, sans-serif',
                    }}>{label}</button>
                  ))}
                </div>
                <textarea value={content} onChange={e => setContent(e.target.value)}
                  placeholder={type==='bug'?L('Hva gikk galt?','What went wrong?'):type==='idea'?L('Hvilken funksjon mangler?','What feature is missing?'):L('Fortell oss hva du synes…','Tell us what you think…')}
                  rows={4} maxLength={2000} style={{
                    width: '100%', padding: '12px', border: '1px solid rgba(42, 29, 20, 0.5)',
                    borderRadius: '8px', fontSize: '0.9375rem', fontFamily: 'Karla, sans-serif',
                    background: '#F1F3EA', color: '#2A1D14', resize: 'none',
                    boxSizing: 'border-box', marginBottom: '14px',
                  }} />
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#4F463A', marginBottom: '6px' }}>{L('Anbefaler du Arvklart? (1-10)', 'Would you recommend Arvklart? (1-10)')}</div>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button key={n} onClick={() => setNps(nps===n?null:n)} style={{
                        flex: 1, padding: '6px 0',
                        border: `1px solid ${nps===n?'#2F573E':'rgba(42, 29, 20, 0.14)'}`,
                        borderRadius: '5px', cursor: 'pointer', fontSize: '0.6875rem',
                        background: nps===n?'#24392A':'#FCFCF9',
                        color: nps===n?'#F4F2EB':'#2A1D14',
                        fontFamily: 'Karla, sans-serif',
                      }}>{n}</button>
                    ))}
                  </div>
                </div>
                <button onClick={send} disabled={sending||(!content.trim()&&nps===null)} style={{
                  width: '100%', padding: '14px',
                  background: (content.trim()||nps!==null)?'#24392A':'#5E6A61',
                  color: '#F4F2EB', border: 'none', borderRadius: '999px',
                  cursor: (content.trim()||nps!==null)?'pointer':'not-allowed',
                  fontSize: '0.9375rem', fontFamily: 'Karla, sans-serif',
                }}>{sending?L('Sender…','Sending…'):L('Send tilbakemelding','Send feedback')}</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
