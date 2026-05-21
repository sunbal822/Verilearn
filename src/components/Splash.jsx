import { useEffect, useState } from 'react'

function LogoMark({ size = 80 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none"
            style={{ animation: 'logoGlow 3s ease-in-out infinite', display: 'block', margin: '0 auto' }}>
            <rect width="80" height="80" rx="20" fill="url(#lg1)" />
            <path d="M20 55 L40 20 L60 55" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M28 42 L52 42" stroke="rgba(255,255,255,0.5)" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="40" cy="20" r="4" fill="#00d4aa" />
            <defs>
                <linearGradient id="lg1" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6c63ff" /><stop offset="1" stopColor="#00d4aa" />
                </linearGradient>
            </defs>
        </svg>
    )
}

export default function Splash({ onDone }) {
    const [phase, setPhase] = useState('logo')

    useEffect(() => {
        const t = setTimeout(() => setPhase('cta'), 2800)
        return () => clearTimeout(t)
    }, [])

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(108,99,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '20%', left: '15%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(0,212,170,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            {phase === 'logo' && (
                <div style={{ animation: 'fadeIn 0.6s ease forwards', textAlign: 'center' }}>
                    <LogoMark size={120} />
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text)', marginTop: 20, textTransform: 'uppercase' }}>VeriLearn</p>
                    <p style={{ color: 'var(--text2)', fontSize: 13, letterSpacing: '0.2em', marginTop: 8, textTransform: 'uppercase' }}>AI Integrity Evaluator</p>
                </div>
            )}

            {phase === 'cta' && (
                <div style={{ animation: 'fadeIn 0.7s ease forwards', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
                    <LogoMark size={72} />
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                            <span style={{ color: 'var(--text)' }}>Prove What</span><br />
                            <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>You Know.</span>
                        </h1>
                        <p style={{ color: 'var(--text2)', fontSize: 16, marginTop: 12, maxWidth: 380, lineHeight: 1.6 }}>
                            Submit your work. Face the AI examiner.<br />Earn your grade honestly.
                        </p>
                    </div>
                    <button
                        onClick={onDone}
                        style={{ background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', color: '#fff', padding: '16px 48px', borderRadius: 50, fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)', letterSpacing: '0.05em', boxShadow: '0 8px 40px rgba(108,99,255,0.4)' }}
                        onMouseEnter={e => { e.target.style.transform = 'translateY(-2px) scale(1.03)'; e.target.style.boxShadow = '0 12px 50px rgba(108,99,255,0.6)' }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.boxShadow = '0 8px 40px rgba(108,99,255,0.4)' }}
                    >
                        ⚡ Begin Evaluation
                    </button>
                    <p style={{ color: 'var(--text2)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI-Powered Academic Integrity</p>
                </div>
            )}
        </div>
    )
}