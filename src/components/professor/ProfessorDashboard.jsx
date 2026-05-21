import { useState, useEffect } from 'react'
import { getResultsBySubject } from '../../utils/professorStorage'

function getScoreColor(percentage) {
    if (percentage >= 70) return '#4caf50'
    if (percentage >= 40) return '#ffc107'
    return '#f44336'
}

export default function ProfessorDashboard({ professor, onLogout }) {
    const [subject, setSubject] = useState(
        professor.subjects?.[0] || ''
    )
    const [inputSubject, setInputSubject] = useState(
        professor.subjects?.[0] || ''
    )
    const [results, setResults] = useState([])

    // Load results whenever subject changes
    useEffect(() => {
        if (subject.trim()) {
            setResults(getResultsBySubject(subject))
        }
    }, [subject])

    const handleSearch = () => {
        if (!inputSubject.trim()) return
        setSubject(inputSubject.trim())
    }

    const avg = results.length
        ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
        : null

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>

            {/* HEADER */}
            <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid #222',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <span style={{ fontWeight: 700 }}>Professor Dashboard</span>
                    <span style={{ color: '#888', fontSize: 13, marginLeft: 10 }}>
                        @{professor.username}
                    </span>
                </div>
                <button
                    onClick={onLogout}
                    style={{
                        background: 'none',
                        border: '1px solid #444',
                        color: '#aaa',
                        padding: '6px 14px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 13
                    }}
                >
                    Log Out
                </button>
            </div>

            <div style={{ padding: '20px 20px' }}>

                {/* SUBJECT SEARCH */}
                <div style={{
                    background: '#111',
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 20
                }}>
                    <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
                        Search by subject
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            placeholder="e.g. Physics"
                            value={inputSubject}
                            onChange={e => setInputSubject(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            style={{
                                flex: 1,
                                padding: '10px 12px',
                                background: '#000',
                                color: '#fff',
                                border: '1px solid #333',
                                borderRadius: 6,
                                outline: 'none',
                                fontSize: 14
                            }}
                        />
                        <button
                            onClick={handleSearch}
                            style={{
                                padding: '10px 18px',
                                background: '#ff9800',
                                color: '#000',
                                border: 'none',
                                borderRadius: 6,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: 14
                            }}
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* STATS ROW */}
                {subject && (
                    <div style={{
                        display: 'flex',
                        gap: 10,
                        marginBottom: 20,
                        flexWrap: 'wrap'
                    }}>
                        <StatCard label="Subject" value={subject} />
                        <StatCard label="Total Students" value={results.length} />
                        {avg !== null && (
                            <StatCard
                                label="Class Average"
                                value={`${avg}%`}
                                valueColor={getScoreColor(avg)}
                            />
                        )}
                    </div>
                )}

                {/* RESULTS TABLE */}
                {subject && results.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        color: '#555',
                        padding: 40,
                        background: '#111',
                        borderRadius: 8
                    }}>
                        No results found for "{subject}"
                    </div>
                )}

                {results.length > 0 && (
                    <div style={{
                        background: '#111',
                        borderRadius: 10,
                        overflow: 'hidden',
                        border: '1px solid #222'
                    }}>
                        {/* Table header */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 100px 80px 80px 80px',
                            padding: '10px 16px',
                            background: '#1a1a1a',
                            borderBottom: '1px solid #222',
                            fontSize: 12,
                            color: '#888',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            <div>Name</div>
                            <div>Roll ID</div>
                            <div style={{ textAlign: 'center' }}>Score</div>
                            <div style={{ textAlign: 'center' }}>%</div>
                            <div style={{ textAlign: 'right' }}>Date</div>
                        </div>

                        {/* Rows */}
                        {results.map((r, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 100px 80px 80px 80px',
                                    padding: '12px 16px',
                                    borderBottom: i < results.length - 1 ? '1px solid #1a1a1a' : 'none',
                                    alignItems: 'center',
                                    background: i % 2 === 0 ? 'transparent' : '#0d0d0d'
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                                <div style={{ color: '#888', fontSize: 13 }}>{r.rollId}</div>
                                <div style={{ textAlign: 'center', color: '#ccc', fontSize: 14 }}>
                                    {r.score}/{r.max}
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{
                                        color: getScoreColor(r.percentage),
                                        fontWeight: 700,
                                        fontSize: 14
                                    }}>
                                        {r.percentage}%
                                    </span>
                                </div>
                                <div style={{
                                    textAlign: 'right',
                                    color: '#555',
                                    fontSize: 12
                                }}>
                                    {r.date}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ label, value, valueColor }) {
    return (
        <div style={{
            flex: 1,
            minWidth: 100,
            background: '#111',
            borderRadius: 8,
            padding: '12px 16px',
            border: '1px solid #222'
        }}>
            <div style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                {label}
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, color: valueColor || '#fff' }}>
                {value}
            </div>
        </div>
    )
}
