import { useState } from 'react'
import { loginProfessor, signUpProfessor } from '../../utils/professorStorage'
import FaceEnroll from './FaceEnroll'
import FaceVerify from './FaceVerify'

export default function ProfessorAuth({ onAuth, onBack }) {
    const [mode, setMode] = useState('login')      // 'login' | 'signup'
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [subject, setSubject] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Face flow stages:
    // null          = not in face flow
    // 'enroll'      = show FaceEnroll after signup
    // 'verify'      = show FaceVerify after successful password login
    const [faceStage, setFaceStage] = useState(null)
    const [pendingProfessor, setPendingProfessor] = useState(null)  // professor object waiting for face verify

    // Check if this professor enrolled a face
    function hasFaceEnrolled(uname) {
        return !!localStorage.getItem(`face_descriptor_${uname.toLowerCase()}`)
    }

    const handleSubmit = () => {
        setError('')
        if (!username.trim()) return setError('Enter a username')
        if (!password.trim()) return setError('Enter a password')
        if (mode === 'signup' && !subject.trim()) return setError('Enter your subject')

        setLoading(true)

        if (mode === 'login') {
            const result = loginProfessor(username.trim(), password)
            if (!result.ok) {
                setError(result.error)
                setLoading(false)
                return
            }
            // If this professor has enrolled face → verify it
            if (hasFaceEnrolled(username.trim())) {
                setPendingProfessor(result.professor)
                setFaceStage('verify')
                setLoading(false)
            } else {
                // No face enrolled → go straight to dashboard
                onAuth(result.professor)
            }
        } else {
            const result = signUpProfessor(username.trim(), password, subject.trim())
            if (!result.ok) {
                setError(result.error)
                setLoading(false)
                return
            }
            // Auto-login then offer face enrollment
            const login = loginProfessor(username.trim(), password)
            setPendingProfessor(login.professor)
            setFaceStage('enroll')
            setLoading(false)
        }
    }

    const switchMode = (m) => {
        setMode(m)
        setError('')
        setUsername('')
        setPassword('')
        setSubject('')
        setFaceStage(null)
        setPendingProfessor(null)
    }

    // ── Face enroll callbacks ──────────────────────────────────────────────────
    const handleEnrolled = () => {
        onAuth(pendingProfessor)
    }
    const handleEnrollSkipped = () => {
        onAuth(pendingProfessor)
    }

    // ── Face verify callbacks ──────────────────────────────────────────────────
    const handleVerified = () => {
        onAuth(pendingProfessor)
    }
    const handleVerifyFailed = () => {
        // Too many failed attempts — go back to login form
        setFaceStage(null)
        setPendingProfessor(null)
        setError('Face verification failed. Please try again or contact your administrator.')
    }
    const handleVerifySkipped = () => {
        // Professor chose to use password only (already verified above)
        onAuth(pendingProfessor)
    }

    // ── Render face stages ─────────────────────────────────────────────────────
    if (faceStage === 'enroll') {
        return (
            <div style={wrapStyle}>
                <div style={cardStyle}>
                    <h2 style={{ marginBottom: 6, textAlign: 'center' }}>Set Up Face ID</h2>
                    <p style={{ color: '#888', textAlign: 'center', fontSize: 13, marginBottom: 4 }}>
                        Optional but recommended
                    </p>
                    <FaceEnroll
                        username={pendingProfessor.username}
                        onEnrolled={handleEnrolled}
                        onSkip={handleEnrollSkipped}
                    />
                </div>
            </div>
        )
    }

    if (faceStage === 'verify') {
        return (
            <div style={wrapStyle}>
                <div style={cardStyle}>
                    <h2 style={{ marginBottom: 6, textAlign: 'center' }}>Face Verification</h2>
                    <p style={{ color: '#888', textAlign: 'center', fontSize: 13, marginBottom: 4 }}>
                        Welcome back, {pendingProfessor?.username}
                    </p>
                    <FaceVerify
                        username={pendingProfessor.username}
                        onVerified={handleVerified}
                        onFailed={handleVerifyFailed}
                        onSkip={handleVerifySkipped}
                    />
                </div>
            </div>
        )
    }

    // ── Normal login / signup form ─────────────────────────────────────────────
    return (
        <div style={wrapStyle}>
            <div style={cardStyle}>

                {/* BACK */}
                <button
                    onClick={onBack}
                    style={{
                        background: 'none', border: 'none', color: '#888',
                        cursor: 'pointer', padding: 0, marginBottom: 20,
                        fontSize: 13, display: 'flex', alignItems: 'center', gap: 4
                    }}
                >
                    ← Back
                </button>

                {/* TITLE */}
                <h2 style={{ marginBottom: 6, textAlign: 'center' }}>Professor Portal</h2>
                <p style={{ color: '#888', textAlign: 'center', fontSize: 13, marginBottom: 24 }}>
                    {mode === 'login' ? 'Sign in to view student results' : 'Create your professor account'}
                </p>

                {/* TAB SWITCHER */}
                <div style={{ display: 'flex', background: '#000', borderRadius: 8, padding: 4, marginBottom: 20 }}>
                    {['login', 'signup'].map(m => (
                        <button
                            key={m}
                            onClick={() => switchMode(m)}
                            style={{
                                flex: 1, padding: '8px 0',
                                background: mode === m ? '#6c63ff' : 'transparent',
                                color: mode === m ? '#fff' : '#888',
                                border: 'none', borderRadius: 6, cursor: 'pointer',
                                fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
                                textTransform: 'capitalize'
                            }}
                        >
                            {m === 'login' ? 'Log In' : 'Sign Up'}
                        </button>
                    ))}
                </div>

                {/* FORM */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={inputStyle}
                        autoComplete="username"
                    />
                    <input
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        style={inputStyle}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    {mode === 'signup' && (
                        <input
                            placeholder="Your Subject (e.g. Physics)"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            style={inputStyle}
                        />
                    )}
                </div>

                {/* Face ID badge for login — shows if this user has face enrolled */}
                {mode === 'login' && username.trim() && hasFaceEnrolled(username.trim()) && (
                    <p style={{ color: '#00d4aa', fontSize: 12, marginTop: 8 }}>
                        🔐 Face ID is active for this account
                    </p>
                )}

                {/* ERROR */}
                {error && (
                    <p style={{ color: '#f44336', marginTop: 10, fontSize: 13 }}>⚠ {error}</p>
                )}

                {/* SUBMIT */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                        width: '100%', marginTop: 16, padding: 14,
                        background: loading ? '#555' : '#ff9800',
                        color: '#000', border: 'none', borderRadius: 6,
                        fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: 15
                    }}
                >
                    {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
                </button>
            </div>
        </div>
    )
}

const wrapStyle = {
    minHeight: '100vh',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    color: '#fff'
}

const cardStyle = {
    width: '100%',
    maxWidth: 420,
    background: '#111',
    padding: 30,
    borderRadius: 12,
    boxShadow: '0 0 20px rgba(0,0,0,0.6)'
}

const inputStyle = {
    padding: 12,
    background: '#000',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: 6,
    outline: 'none',
    fontSize: 14
}
