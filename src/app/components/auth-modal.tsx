import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type Mode = 'login' | 'register'

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setUsername('')
    setEmail('')
    setPassword('')
    setError('')
    setSuccess('')
    setLoading(false)
  }

  const switchMode = (m: Mode) => {
    reset()
    setMode(m)
  }

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      onClose()
      reset()
    }
  }

  const handleRegister = async () => {
    if (!username.trim()) { setError('Username is required'); return }
    if (username.length < 3) { setError('Username must be at least 3 characters'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess('Account created! Awaiting DM approval to access the Play portal.')
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(6,8,15,0.8)',
    border: '1px solid rgba(212,175,55,0.2)',
    color: '#e8d9b5',
    fontFamily: "'Crimson Pro', serif",
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontFamily: "'Cinzel', serif",
    fontSize: '0.58rem',
    letterSpacing: '0.18em',
    color: 'rgba(212,175,55,0.7)',
    textTransform: 'uppercase' as const,
    display: 'block',
    marginBottom: 6,
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(2,4,10,0.85)',
              backdropFilter: 'blur(6px)',
            }}
          />

          {/* Modal — centered via flexbox on a full-screen container */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 101,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                pointerEvents: 'all',
                width: '100%', maxWidth: 420,
                background: 'linear-gradient(160deg, #0d1120 0%, #06080f 100%)',
                border: '1px solid rgba(212,175,55,0.25)',
                boxShadow: '0 0 60px rgba(212,175,55,0.08), 0 25px 60px rgba(0,0,0,0.6)',
                padding: '40px 36px',
                position: 'relative',
                margin: '0 16px',
              }}
            >
              {/* Corner accents */}
              {[
                { top: 0, left: 0, borderTop: '1px solid #d4af37', borderLeft: '1px solid #d4af37' },
                { top: 0, right: 0, borderTop: '1px solid #d4af37', borderRight: '1px solid #d4af37' },
                { bottom: 0, left: 0, borderBottom: '1px solid #d4af37', borderLeft: '1px solid #d4af37' },
                { bottom: 0, right: 0, borderBottom: '1px solid #d4af37', borderRight: '1px solid #d4af37' },
              ].map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: 16, height: 16, ...s }} />
              ))}

              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: '0.58rem', letterSpacing: '0.25em', color: '#d4af37', textTransform: 'uppercase', marginBottom: 8 }}>
                  {mode === 'login' ? 'Welcome Back' : 'Join the Campaign'}
                </p>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.5rem', color: '#e8d9b5', fontWeight: 700, margin: 0 }}>
                  {mode === 'login' ? 'Enter Serenita' : 'Register Your Name'}
                </h2>
                <div style={{ width: 48, height: 1, background: 'linear-gradient(to right, transparent, #d4af37, transparent)', margin: '14px auto 0' }} />
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', marginBottom: 28, border: '1px solid rgba(212,175,55,0.15)' }}>
                {(['login', 'register'] as Mode[]).map((m) => (
                  <button key={m} onClick={() => switchMode(m)}
                    style={{
                      flex: 1, padding: '10px 0',
                      background: mode === m ? 'rgba(212,175,55,0.12)' : 'transparent',
                      border: 'none',
                      borderBottom: mode === m ? '2px solid #d4af37' : '2px solid transparent',
                      color: mode === m ? '#d4af37' : 'rgba(232,217,181,0.35)',
                      fontFamily: "'Cinzel', serif",
                      fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                    }}>
                    {m === 'login' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>

              {/* Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {mode === 'register' && (
                  <div>
                    <label style={labelStyle}>Adventurer Name</label>
                    <input
                      style={inputStyle}
                      placeholder="Your character name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(212,175,55,0.2)')}
                    />
                  </div>
                )}
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    style={inputStyle}
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(212,175,55,0.2)')}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Password</label>
                  <input
                    style={inputStyle}
                    type="password"
                    placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(212,175,55,0.2)')}
                  />
                </div>
              </div>

              {/* Error / Success */}
              <AnimatePresence>
                {error && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ fontFamily: "'Crimson Pro', serif", color: '#f87171', fontSize: '0.88rem', marginTop: 14, textAlign: 'center' }}>
                    {error}
                  </motion.p>
                )}
                {success && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ fontFamily: "'Crimson Pro', serif", color: '#86efac', fontSize: '0.88rem', marginTop: 14, textAlign: 'center', lineHeight: 1.6 }}>
                    {success}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit button */}
              {!success && (
                <button
                  onClick={mode === 'login' ? handleLogin : handleRegister}
                  disabled={loading}
                  style={{
                    width: '100%', marginTop: 24, padding: '13px 0',
                    background: loading ? 'rgba(212,175,55,0.08)' : 'transparent',
                    border: '1px solid rgba(212,175,55,0.5)',
                    color: loading ? 'rgba(212,175,55,0.4)' : '#d4af37',
                    fontFamily: "'Cinzel', serif",
                    fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.25s ease',
                    position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,175,55,0.12)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(212,175,55,0.15)' }}}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none' }}
                >
                  {loading ? 'Please wait...' : mode === 'login' ? 'Enter the Realm' : 'Submit Your Name'}
                </button>
              )}

              {mode === 'register' && !success && (
                <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: '0.82rem', color: 'rgba(232,217,181,0.35)', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
                  After registering, the Dungeon Master must approve your account before you can access the Play portal.
                </p>
              )}

              {/* Close */}
              <button onClick={onClose}
                style={{
                  position: 'absolute', top: 14, right: 16,
                  background: 'none', border: 'none',
                  color: 'rgba(212,175,55,0.4)', fontSize: '1.1rem',
                  cursor: 'pointer', transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#d4af37')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(212,175,55,0.4)')}
              >
                ✕
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}