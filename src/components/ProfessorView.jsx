import { useState, useEffect } from 'react'
import { getRecords, clearRecords } from '../utils/storage'
import FaceEnroll from './professor/FaceEnroll'
import FaceVerify from './professor/FaceVerify'

const PROF_KEY = 'viva_professor_accounts'

function getAccounts() {
    try { return JSON.parse(localStorage.getItem(PROF_KEY) || '{}') } catch { return {} }
}

function saveAccount(username, password, subject) {
    const accounts = getAccounts()
    accounts[username.toLowerCase()] = { password, subject: subject.trim().toLowerCase() }
    localStorage.setItem(PROF_KEY, JSON.stringify(accounts))
}

function checkLogin(username, password) {
    const accounts = getAccounts()
    const acc = accounts[username.toLowerCase()]
    if (!acc) return { ok: false, error: 'Username not found' }
    if (acc.password !== password) return { ok: false, error: 'Wrong password' }
    return { ok: true, subject: acc.subject }
}

function hasFaceEnrolled(username) {
    return !!localStorage.getItem(`face_descriptor_${username.toLowerCase()}`)
}

function AuthScreen({ onAuth }) {
    const [mode, setMode] = useState('login')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [subject, setSubject] = useState('')
    const [error, setError] = useState('')
    const [faceStage, setFaceStage] = useState(null)
    const [pendingProf, setPendingProf] = useState(null)
    const [usePasswordMode, setUsePasswordMode] = useState(false)  // ← NEW

    const showFaceOptions = mode === 'login' && username.trim() && hasFaceEnrolled(username.trim()) && !usePasswordMode

    const handleSubmit = () => {
        setError('')
        if (!username.trim()) return setError('Enter username')
        if (!password.trim()) return setError('Enter password')

        if (mode === 'signup') {
            if (!subject.trim()) return setError('Enter your subject')
            const accounts = getAccounts()
            if (accounts[username.toLowerCase()]) return setError('Username already taken')
            saveAccount(username.trim(), password, subject)
            const prof = { username: username.trim().toLowerCase(), subject: subject.trim().toLowerCase() }
            setPendingProf(prof)
            setFaceStage('enroll')
        } else {
            const res = checkLogin(username.trim(), password)
            if (!res.ok) return setError(res.error)
            onAuth({ username: username.trim().toLowerCase(), subject: res.subject })
        }
    }

    // Face enroll screen
    if (faceStage === 'enroll') {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32 }}>
                    <h2 style={{ textAlign: 'center', marginBottom: 6 }}>Set Up Face ID</h2>
                    <p style={{ color: 'var(--text2)', textAlign: 'center', fontSize: 13, marginBottom: 4 }}>Optional but recommended</p>
                    <FaceEnroll
                        username={pendingProf.username}
                        onEnrolled={() => onAuth(pendingProf)}
                        onSkip={() => onAuth(pendingProf)}
                    />
                </div>
            </div>
        )
    }

    // Face verify screen
    if (faceStage === 'verify') {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32 }}>
                    <h2 style={{ textAlign: 'center', marginBottom: 6 }}>Face Verification</h2>
                    <p style={{ color: 'var(--text2)', textAlign: 'center', fontSize: 13, marginBottom: 4 }}>Welcome back, {pendingProf?.username}</p>
                    <FaceVerify
                        username={pendingProf.username}
                        onVerified={() => onAuth(pendingProf)}
                        onFailed={() => {
                            setFaceStage(null)
                            setPendingProf(null)
                            setUsePasswordMode(true)
                            setError('Face verification failed. Please use your password.')
                        }}
                        onSkip={() => onAuth(pendingProf)}
                    />
                </div>
            </div>
        )
    }

    const s = (active) => ({
        flex: 1, padding: '8px 0',
        background: active ? '#6c63ff' : 'transparent',
        color: active ? '#fff' : 'var(--text2)',
        border: 'none', borderRadius: 6, cursor: 'pointer',
        fontWeight: 600, fontSize: 13, transition: 'all 0.2s'
    })

    const inp = {
        width: '100%', boxSizing: 'border-box',
        padding: '12px', background: 'var(--surface2)',
        color: 'var(--text)', border: '1px solid var(--border)',
        borderRadius: 8, outline: 'none', fontSize: 14
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ width: '100%', maxWidth: 400, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 6 }}>Professor Portal</h2>
                <p style={{ color: 'var(--text2)', textAlign: 'center', fontSize: 13, marginBottom: 24 }}>
                    {mode === 'login' ? 'Sign in to view student results' : 'Create your account'}
                </p>

                <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 8, padding: 4, marginBottom: 20 }}>
                    <button style={s(mode === 'login')} onClick={() => { setMode('login'); setError(''); setUsePasswordMode(false) }}>Log In</button>
                    <button style={s(mode === 'signup')} onClick={() => { setMode('signup'); setError(''); setUsePasswordMode(false) }}>Sign Up</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                        placeholder="Username"
                        value={username}
                        onChange={e => { setUsername(e.target.value); setUsePasswordMode(false) }}
                        style={inp}
                    />
                    {/* Show password field when: signup, OR password mode, OR no face enrolled */}
                    {(!showFaceOptions) && (
                        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inp} />
                    )}
                    {mode === 'signup' && (
                        <input placeholder="Your Subject (e.g. Physics)" value={subject} onChange={e => setSubject(e.target.value)} style={inp} />
                    )}
                </div>

                {error && <p style={{ color: '#ff4757', fontSize: 13, marginTop: 10 }}>⚠ {error}</p>}

                {/* Face ID options */}
                {showFaceOptions ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                        <button
                            onClick={() => {
                                const accounts = getAccounts()
                                const acc = accounts[username.toLowerCase()]
                                if (!acc) return setError('Username not found')
                                const prof = { username: username.trim().toLowerCase(), subject: acc.subject }
                                setPendingProf(prof)
                                setFaceStage('verify')
                            }}
                            style={{ width: '100%', padding: 13, background: 'linear-gradient(135deg, #00d4aa, #00a88a)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                        >
                            🔐 Log In with Face ID
                        </button>
                        <button
                            onClick={() => { setUsePasswordMode(true); setError('') }}
                            style={{ width: '100%', padding: 13, background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                        >
                            Use Password Instead
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleSubmit}
                        style={{ width: '100%', marginTop: 16, padding: 13, background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                    >
                        {mode === 'login' ? 'Log In' : 'Create Account'}
                    </button>
                )}
            </div>
        </div>
    )
}

export default function ProfessorView({ onBack }) {
    const [professor, setProfessor] = useState(null)
    const [records, setRecords] = useState([])

    useEffect(() => {
        if (!professor) return
        const all = getRecords()
        const filtered = all.filter(r => (r.subject || '').trim().toLowerCase() === professor.subject)
        const unique = Array.from(new Map(filtered.map(r => [r.rollId, r])).values())
        setRecords(unique)
    }, [professor])

    if (!professor) return <AuthScreen onAuth={setProfessor} />

    const gc = (g) => ({ 'A+': '#00d4aa', 'A': '#6c63ff', 'B': '#ffa502', 'C': '#ff793f' }[g] || '#ff4757')

    const exportCSV = () => {
        const rows = records.map(r => `"${r.name}","${r.rollId}","${r.subject || ''}",${r.score},${r.max},"${r.grade}","${r.status}","${r.timestamp}"`)
        const csv = ['Name,Roll ID,Subject,Score,Max,Grade,Status,Timestamp', ...rows].join('\n')
        const a = document.createElement('a')
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
        a.download = 'verilearn_records.csv'; a.click()
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--primary)', padding: '32px 20px' }}>
            <div style={{ maxWidth: 780, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>Professor View</h1>
                        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
                            Subject: <strong style={{ color: 'var(--accent2)', textTransform: 'capitalize' }}>{professor.subject}</strong>
                            &nbsp;·&nbsp; {records.length} record{records.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button onClick={onBack} style={{ padding: '10px 18px', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>← Back</button>
                        <button onClick={() => setProfessor(null)} style={{ padding: '10px 18px', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>🔒 Log Out</button>
                        <button onClick={exportCSV} style={{ padding: '10px 18px', background: 'linear-gradient(135deg, var(--accent2), #00a88a)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>⬇ Export CSV</button>
                        <button onClick={() => { clearRecords(); setRecords([]) }} style={{ padding: '10px 18px', background: 'rgba(255,71,87,0.12)', color: 'var(--danger)', border: '1px solid rgba(255,71,87,0.25)', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>🗑 Clear</button>
                    </div>
                </div>

                {records.length === 0 ? (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 48, textAlign: 'center', color: 'var(--text2)' }}>
                        <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
                        <p>No records yet for <strong style={{ textTransform: 'capitalize' }}>{professor.subject}</strong>.</p>
                        <p style={{ fontSize: 13, marginTop: 8 }}>Students must enter this exact subject name when taking the viva.</p>
                    </div>
                ) : (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        {['Name', 'Roll ID', 'Score', 'Grade', 'Status', 'Time'].map(h => (
                                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text2)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((r, i) => (
                                        <tr key={i} style={{ borderBottom: i < records.length - 1 ? '1px solid var(--border)' : 'none', background: r.status?.includes('FLAGGED') ? 'rgba(255,71,87,0.04)' : 'transparent' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: 500 }}>{r.name}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text2)', fontFamily: 'monospace', fontSize: 13 }}>{r.rollId}</td>
                                            <td style={{ padding: '12px 16px', fontWeight: 700, color: gc(r.grade) }}>{r.score}/{r.max}</td>
                                            <td style={{ padding: '12px 16px' }}><span style={{ padding: '3px 10px', borderRadius: 50, background: `${gc(r.grade)}18`, color: gc(r.grade), fontWeight: 700, fontSize: 13 }}>{r.grade}</span></td>
                                            <td style={{ padding: '12px 16px' }}><span style={{ padding: '3px 10px', borderRadius: 50, background: r.status?.includes('FLAGGED') ? 'rgba(255,71,87,0.12)' : 'rgba(0,212,170,0.1)', color: r.status?.includes('FLAGGED') ? 'var(--danger)' : 'var(--accent2)', fontSize: 11, fontWeight: 700 }}>{r.status?.includes('FLAGGED') ? '⚠ FLAGGED' : '✓ DONE'}</span></td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text2)', fontSize: 12 }}>{new Date(r.timestamp).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
