import { useEffect, useState } from 'react'

const messages = [
    '🔍 Reading your assignment...',
    '🧠 Understanding key concepts...',
    '⚡ Crafting adaptive questions...',
    '🎯 Calibrating difficulty levels...',
    '✅ Viva ready. Brace yourself.',
]

export default function AILoading() {
    const [msgIndex, setMsgIndex] = useState(0)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex(i => Math.min(i + 1, messages.length - 1))
            setProgress(p => Math.min(p + 20, 95))
        }, 1200)
        return () => clearInterval(interval)
    }, [])

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', gap: 40, padding: 24 }}>
            <div style={{ position: 'relative', width: 120, height: 120 }}>
                <svg width="120" height="120" style={{ animation: 'spin 2s linear infinite', position: 'absolute', top: 0, left: 0 }}>
                    <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface3)" strokeWidth="6" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke="url(#sg)" strokeWidth="6" strokeLinecap="round" strokeDasharray="100 228" />
                    <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="var(--accent)" /><stop offset="100%" stopColor="var(--accent2)" /></linearGradient></defs>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🤖</div>
            </div>
            <div style={{ textAlign: 'center', maxWidth: 400 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>AI is Doing Its Magic</h2>
                <p style={{ color: 'var(--text2)', fontSize: 15, minHeight: 24 }}>{messages[msgIndex]}</p>
            </div>
            <div style={{ width: '100%', maxWidth: 360 }}>
                <div style={{ width: '100%', height: 6, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent2))', borderRadius: 3, transition: 'width 1s ease' }} />
                </div>
                <p style={{ textAlign: 'right', fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>{progress}%</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />)}
            </div>
        </div>
    )
}