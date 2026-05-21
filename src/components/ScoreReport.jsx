import { useEffect, useState } from 'react'
import { saveRecord } from '../utils/storage'

const getGrade = (score, max) => {
    const p = (score / max) * 10
    if (p >= 9) return { grade: 'A+', label: 'Outstanding', color: '#00d4aa', bg: 'rgba(0,212,170,0.12)' }
    if (p >= 7) return { grade: 'A', label: 'Excellent', color: '#6c63ff', bg: 'rgba(108,99,255,0.12)' }
    if (p >= 5) return { grade: 'B', label: 'Satisfactory', color: '#ffa502', bg: 'rgba(255,165,2,0.12)' }
    if (p >= 3) return { grade: 'C', label: 'Needs Improvement', color: '#ff793f', bg: 'rgba(255,121,63,0.12)' }
    return { grade: 'F', label: 'Insufficient Understanding', color: '#ff4757', bg: 'rgba(255,71,87,0.12)' }
}

export default function ScoreReport({ studentData, result, answers, onRestart }) {
    const { grade, label, color, bg } = getGrade(result.total, result.max)

    useEffect(() => {
        saveRecord({
            name: studentData.name,
            rollId: studentData.rollId,
            subject: studentData.subject,
            score: result.total,
            max: result.max,
            grade,
            status: 'COMPLETED',
            timestamp: new Date().toISOString()
        })
    }, [])

    const circ = 2 * Math.PI * 54
    const dash = circ * (1 - result.total / result.max)

    return (
        <div style={{ minHeight: '100vh', background: 'var(--primary)', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: 600, animation: 'fadeIn 0.5s ease' }}>
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Viva Complete</h1>
                    <p style={{ color: 'var(--text2)' }}>{studentData.name} — {studentData.rollId}</p>
                </div>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '36px 28px', textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                        <svg width="128" height="128">
                            <circle cx="64" cy="64" r="54" fill="none" stroke="var(--surface3)" strokeWidth="10" />
                            <circle cx="64" cy="64" r="54" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
                                strokeDasharray={circ} strokeDashoffset={dash}
                                transform="rotate(-90 64 64)"
                                style={{ transition: 'stroke-dashoffset 1s ease' }} />
                        </svg>
                        <div style={{ position: 'absolute', textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color }}>{result.total}</div>
                            <div style={{ fontSize: 12, color: 'var(--text2)' }}>/ {result.max}</div>
                        </div>
                    </div>
                    <div style={{ display: 'inline-block', padding: '8px 24px', borderRadius: 50, background: bg, border: `1px solid ${color}40`, marginBottom: 8 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color }}>{grade}</span>
                    </div>
                    <p style={{ color: 'var(--text2)', fontSize: 15 }}>{label}</p>
                </div>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Question Breakdown</h3>
                    </div>
                    {answers.map((a, i) => (
                        <div key={i} style={{ padding: '14px 20px', borderBottom: i < answers.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{a.score > 0 ? '✅' : '❌'}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4, lineHeight: 1.4 }}>{a.question?.question || `Q${i + 1}`}</p>
                                <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.4 }}>{a.feedback}</p>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, flexShrink: 0, color: a.score > 0 ? 'var(--accent2)' : 'var(--text2)' }}>{a.score}/10</span>
                        </div>
                    ))}
                </div>

                <div style={{ padding: '12px 16px', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 12, color: 'var(--accent2)', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
                    ✅ Record saved
                </div>

                <button
                    onClick={onRestart}
                    style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-display)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(108,99,255,0.3)' }}
                >
                    ⚡ New Evaluation
                </button>
            </div>
        </div>
    )
}
