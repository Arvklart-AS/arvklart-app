import { useState } from 'react'
import { supabase, signIn, signUp } from '../lib/supabase'
import { L } from '../lib/lang'
import { HOME } from '../lib/routes'
import TextSizeControl from '../components/TextSizeControl'

const hasPendingInvite = () => { try { return Boolean(localStorage.getItem('pendingJoinCode')) } catch { return false } }

export default function LoginPage({ onToast }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)
  const [invited] = useState(hasPendingInvite)

  const errMsg = (msg) => {
    if (msg.includes('Invalid login')) return L('Feil e-post eller passord', 'Wrong email or password')
    if (msg.includes('Email not confirmed')) return L('E-posten er ikke bekreftet ennå — sjekk innboksen din', 'Your email is not confirmed yet — check your inbox')
    if (msg.includes('already registered')) return L('E-posten er allerede registrert — logg inn i stedet', 'This email is already registered — log in instead')
    if (msg.includes('known to be weak') || msg.includes('pwned')) return L('Passordet finnes i kjente datalekkasjer — velg et annet', 'This password appears in known data breaches — choose another one')
    if (msg.includes('Password should')) return L('Passordet må ha minst 6 tegn', 'The password must have at least 6 characters')
    if (msg.includes('rate limit') || msg.includes('security purposes')) return L('For mange forsøk — vent litt og prøv igjen', 'Too many attempts — wait a moment and try again')
    return msg
  }

  const switchMode = (m) => { setMode(m); setResetSent(false); setConfirmSent(false) }

  const handleReset = async () => {
    if (!email.trim()) return
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/nytt-passord`,
    })
    setLoading(false)
    if (error) { onToast(errMsg(error.message), 'error'); return }
    setResetSent(true)
  }

  const handleSubmit = async () => {
    if (mode === 'forgot') return handleReset()
    if (!email.trim() || !password.trim()) return
    if (mode === 'signup' && !name.trim()) return
    setLoading(true)

    if (mode === 'signup') {
      // Profilen opprettes fra navnet i App når brukeren er logget inn
      const { data, error } = await signUp(email.trim(), password, name.trim())
      if (error) { onToast(errMsg(error.message), 'error'); setLoading(false); return }
      // Uten økt må e-posten bekreftes først. Tom identities betyr at e-posten allerede er registrert.
      if (!data?.session) {
        if (data?.user && !data.user.identities?.length) onToast(errMsg('already registered'), 'error')
        else setConfirmSent(true)
      }
    } else {
      const { error } = await signIn(email.trim(), password)
      if (error) { onToast(errMsg(error.message), 'error') }
    }
    setLoading(false)
  }

  const canSubmit = mode === 'forgot'
    ? email.trim()
    : email.trim() && password.trim() && (mode === 'login' || name.trim())

  return (
    <div style={{ minHeight:'100vh', background:'#ECF0E2', display:'flex', fontFamily:'Karla, sans-serif' }}>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px' }}>
        <div style={{ maxWidth:'400px', width:'100%' }}>
          {/* Siden har ingen header, så veien tilbake står her (samme uttrykk som de offentlige sidene) */}
          <a href={HOME} style={{ display:'inline-flex', alignItems:'center', minHeight:'44px', marginBottom:'12px', color:'#4F463A', fontSize:'0.9375rem', textDecoration:'underline', textUnderlineOffset:'4px' }}>
            {L('← Til forsiden', '← To the home page')}
          </a>
          <div style={{ textAlign:'center', marginBottom:'36px' }}>
            {/* Logoen fra nettsiden (samme maske som headeren). Navnet står som tekst for skjermlesere. */}
            <h1 style={{ margin:'0 0 12px' }}>
              <span aria-hidden="true" style={{ display:'block', width:'168px', aspectRatio:'460/122', margin:'0 auto', background:'#24392A', WebkitMask:'url(/nettsted/logo-maske.png) no-repeat center/contain', mask:'url(/nettsted/logo-maske.png) no-repeat center/contain' }} />
              <span style={{ position:'absolute', width:'1px', height:'1px', overflow:'hidden', clipPath:'inset(50%)', whiteSpace:'nowrap' }}>Arvklart</span>
            </h1>
            <p style={{ color:'#4F463A', fontSize:'1rem', lineHeight:'1.6' }}>{L('Registrer, ønsk og fordel innbo og løsøre – samlet og dokumentert', 'Register, wish for and divide household contents – in one place, documented')}</p>
          </div>

          <div style={{ background:'#fff', border:'1px solid #CFC8BA', borderRadius:'14px', padding:'36px', boxShadow:'0 4px 32px rgba(0,0,0,0.06)' }}>
            {mode==='forgot' ? (
              <div style={{ marginBottom:'24px' }}>
                <h2 style={{ fontFamily:"'Bodoni Moda', 'Times New Roman', serif", fontOpticalSizing:'none', fontSize:'1.5rem', fontWeight:'400', color:'#1F2326', marginBottom:'8px' }}>{L('Glemt passord', 'Forgot password')}</h2>
                <p style={{ color:'#575B5E', fontSize:'0.875rem', lineHeight:'1.6', margin:0 }}>{L('Skriv inn e-postadressen din, så sender vi deg en lenke for å velge nytt passord.', 'Enter your email address and we will send you a link to choose a new password.')}</p>
              </div>
            ) : (
            <div style={{ display:'flex', background:'#EAE5DA', borderRadius:'8px', padding:'4px', marginBottom:'28px' }}>
              {[['login',L('Logg inn','Log in')],['signup',L('Opprett konto','Create account')]].map(([m,l]) => (
                <button key={m} onClick={()=>switchMode(m)} style={{
                  flex:1, padding:'9px', border:'none', borderRadius:'6px', cursor:'pointer',
                  background:mode===m?'#fff':'transparent',
                  color:mode===m?'#1F2326':'#575B5E', fontSize:'0.875rem', fontFamily:'Karla, sans-serif',
                  boxShadow:mode===m?'0 1px 4px rgba(0,0,0,0.08)':'none', transition:'all 0.15s',
                }}>{l}</button>
              ))}
            </div>
            )}

            {invited && mode !== 'forgot' && !confirmSent && (
              <div style={{ background:'#EAE5DA', borderRadius:'8px', padding:'12px 14px', fontSize:'0.8125rem', color:'#2F4A43', lineHeight:'1.5', marginBottom:'18px' }}>
                {L('Du er invitert til et bo. Logg inn eller opprett konto med e-posten invitasjonen ble sendt til, så blir du med automatisk.', 'You have been invited to an estate. Log in or create an account with the email the invitation was sent to, and you will join automatically.')}
              </div>
            )}

            {confirmSent ? (
              <div style={{ background:'#EAE5DA', borderRadius:'8px', padding:'16px', fontSize:'0.875rem', color:'#1F2326', lineHeight:'1.6', marginBottom:'4px' }}>
                {L('Vi har sendt en bekreftelseslenke til', 'We have sent a confirmation link to')} <strong>{email.trim()}</strong>. {L('Klikk på lenken i e-posten for å fullføre registreringen. Sjekk søppelpost hvis den ikke dukker opp.', 'Click the link in the email to complete your registration. Check your spam folder if it does not arrive.')}
              </div>
            ) : mode==='forgot' && resetSent ? (
              <div style={{ background:'#EAE5DA', borderRadius:'8px', padding:'16px', fontSize:'0.875rem', color:'#1F2326', lineHeight:'1.6', marginBottom:'4px' }}>
                {L('Hvis det finnes en konto for', 'If an account exists for')} <strong>{email.trim()}</strong>, {L('får du snart en e-post med en lenke for å tilbakestille passordet. Sjekk søppelpost hvis den ikke dukker opp.', 'you will soon receive an email with a link to reset your password. Check your spam folder if it does not show up.')}
              </div>
            ) : (<>

            <div style={{ display:'flex', flexDirection:'column', gap:'14px', marginBottom:'20px' }}>
              {mode==='signup' && (
                <div>
                  <label htmlFor="login-f1" style={{ display:'block', fontSize:'0.8125rem', color:'#575B5E', marginBottom:'6px' }}>{L('Ditt navn *', 'Your name *')}</label>
                  <input id="login-f1" autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder={L('f.eks. Kari Nordmann', 'e.g. Jane Smith')} maxLength={100}
                    style={{ width:'100%', padding:'12px 14px', border:'1px solid #575B5E', borderRadius:'8px', fontSize:'0.9375rem', background:'#F5F2EB', color:'#1F2326', fontFamily:'Karla, sans-serif', boxSizing:'border-box' }} />
                </div>
              )}
              <div>
                <label htmlFor="login-f2" style={{ display:'block', fontSize:'0.8125rem', color:'#575B5E', marginBottom:'6px' }}>{L('E-post *', 'Email *')}</label>
                <input id="login-f2" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} placeholder={L('deg@eksempel.no', 'you@example.com')} maxLength={254}
                  style={{ width:'100%', padding:'12px 14px', border:'1px solid #575B5E', borderRadius:'8px', fontSize:'0.9375rem', background:'#F5F2EB', color:'#1F2326', fontFamily:'Karla, sans-serif', boxSizing:'border-box' }} />
              </div>
              {mode!=='forgot' && (
              <div>
                <label htmlFor="login-f3" style={{ display:'block', fontSize:'0.8125rem', color:'#575B5E', marginBottom:'6px' }}>{L('Passord *', 'Password *')}</label>
                <input id="login-f3" type="password" autoComplete={mode==='signup' ? 'new-password' : 'current-password'} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} placeholder={mode==='signup'?L('Minst 6 tegn','At least 6 characters'):'••••••••'} maxLength={128}
                  style={{ width:'100%', padding:'12px 14px', border:'1px solid #575B5E', borderRadius:'8px', fontSize:'0.9375rem', background:'#F5F2EB', color:'#1F2326', fontFamily:'Karla, sans-serif', boxSizing:'border-box' }} />
                {mode==='login' && (
                  <div style={{ textAlign:'right', marginTop:'6px' }}>
                    <button onClick={()=>switchMode('forgot')} style={{ background:'none', border:'none', padding:0, color:'#8A5A34', cursor:'pointer', fontSize:'0.8125rem', fontFamily:'Karla, sans-serif', textDecoration:'underline' }}>{L('Glemt passord?', 'Forgot password?')}</button>
                  </div>
                )}
              </div>
              )}
            </div>

            <button onClick={handleSubmit} disabled={loading||!canSubmit} style={{
              width:'100%', padding:'13px', background:canSubmit?'#24392A':'#CFC8BA',
              color:'#F5F2EB', border:'none', borderRadius:'8px',
              cursor:canSubmit?'pointer':'not-allowed', fontSize:'0.9375rem', fontFamily:'Karla, sans-serif',
            }}>{loading?L('Vent litt…','Please wait…'):mode==='login'?L('Logg inn','Log in'):mode==='forgot'?L('Send lenke','Send link'):L('Opprett konto','Create account')}</button>
            </>)}

            {mode==='signup' && (
              <p style={{ textAlign:'center', marginTop:'12px', fontSize:'0.75rem', color:'#575B5E', lineHeight:'1.6' }}>
                {L('Ved å opprette konto godtar du våre', 'By creating an account you accept our')}{' '}
                <a href="/personvern" style={{ color:'#2F4A43' }}>{L('vilkår og personvernerklæring', 'terms and privacy policy')}</a>.
              </p>
            )}

            <p style={{ textAlign:'center', marginTop:'16px', fontSize:'0.8125rem', color:'#575B5E' }}>
              {mode==='forgot'?<button onClick={()=>switchMode('login')} style={{ background:'none', border:'none', color:'#8A5A34', cursor:'pointer', fontSize:'0.8125rem', fontFamily:'Karla, sans-serif', textDecoration:'underline' }}>{L('Tilbake til innlogging', 'Back to log in')}</button>
              :mode==='login'?<>{L('Ny her?', 'New here?')}{' '}<button onClick={()=>switchMode('signup')} style={{ background:'none', border:'none', color:'#8A5A34', cursor:'pointer', fontSize:'0.8125rem', fontFamily:'Karla, sans-serif', textDecoration:'underline' }}>{L('Opprett konto', 'Create account')}</button></>
              :<>{L('Har du konto?', 'Have an account?')}{' '}<button onClick={()=>switchMode('login')} style={{ background:'none', border:'none', color:'#8A5A34', cursor:'pointer', fontSize:'0.8125rem', fontFamily:'Karla, sans-serif', textDecoration:'underline' }}>{L('Logg inn', 'Log in')}</button></>}
            </p>
          </div>

          <div style={{ marginTop:'20px' }}><TextSizeControl light /></div>
        </div>
      </div>
    </div>
  )
}
