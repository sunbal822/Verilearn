import { useState, useCallback, useRef } from 'react'
import Timer from './Timer'
import VoiceInput from './VoiceInput'
import { evaluateAnswer } from '../services/groq'
import useAntiCheat from '../hooks/useAntiCheat'

function getFeedbackTheme(score) {
    if (score >= 7) return { bg: '#0a2e0a', border: '#2a7a2a', accent: '#4caf50', label: 'Correct' }
    if (score >= 4) return { bg: '#2e2a00', border: '#7a6a00', accent: '#ffc107', label: 'Partial' }
    return { bg: '#2e0a0a', border: '#7a2a2a', accent: '#f44336', label: 'Incorrect' }
}

export default function VivaSession({ questions, studentData, onComplete, onCheat }) {

    const [current, setCurrent] = useState(0)
    const [answer, setAnswer] = useState('')
    const [answers, setAnswers] = useState([])
    const [evaluating, setEvaluating] = useState(false)
    const [lastFeedback, setLastFeedback] = useState(null)
    const [waitingNext, setWaitingNext] = useState(false)

    const answersRef = useRef([])
    const completedRef = useRef(false)
    const cheatedRef = useRef(false)
    const pendingAnswers = useRef(null)

    useAntiCheat(() => {
        if (cheatedRef.current || completedRef.current) return
        cheatedRef.current = true
        completedRef.current = true
        onCheat(studentData, answersRef.current)
    })

    const finishExam = useCallback((finalAnswers) => {
        if (completedRef.current || cheatedRef.current) return
        completedRef.current = true
        const max = questions.length * 10
        const total = finalAnswers.reduce((sum, a) => sum + (a.score || 0), 0)
        onComplete(finalAnswers, { total, max, percentage: Math.round((total / max) * 100) })
    }, [questions, onComplete])

    const handleNext = () => {
        const updatedAnswers = pendingAnswers.current
        setLastFeedback(null)
        setWaitingNext(false)
        pendingAnswers.current = null
        if (current + 1 >= questions.length) {
            finishExam(updatedAnswers)
        } else {
            setCurrent(prev => prev + 1)
        }
    }

    const handleSubmit = async () => {
        if (!answer.trim() || evaluating || waitingNext) return
        setEvaluating(true)
        setLastFeedback(null)
        const q = questions[current]
        const res = await evaluateAnswer(q.question, answer, q.difficulty)
        const newAns = { question: q, answer, score: res.score, feedback: res.feedback }
        const updatedAnswers = [...answers, newAns]
        setAnswers(updatedAnswers)
        answersRef.current = updatedAnswers
        pendingAnswers.current = updatedAnswers
        setAnswer('')
        setEvaluating(false)
        setLastFeedback({ score: res.score, feedback: res.feedback })
        setWaitingNext(true)
    }

    const handleSkip = () => {
        if (evaluating || waitingNext) return
        const q = questions[current]
        const newAns = { question: q, answer: '', score: 0, feedback: 'Skipped' }
        const updatedAnswers = [...answers, newAns]
        setAnswers(updatedAnswers)
        answersRef.current = updatedAnswers
        setAnswer('')
        if (current + 1 >= questions.length) {
            finishExam(updatedAnswers)
        } else {
            setCurrent(prev => prev + 1)
        }
    }

    const q = questions?.[current]
    const theme = lastFeedback ? getFeedbackTheme(lastFeedback.score) : null

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>

            {/* HEADER */}
            <div style={{ padding: 12, textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #222' }}>
                Viva Active
            </div>

            {/* TOP BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 15 }}>
                <div>Q {current + 1} / {questions.length}</div>
                <Timer
                    key={current}
                    totalSeconds={120}
                    onTimeout={() => finishExam(answersRef.current)}
                />
            </div>

            {/* QUESTION */}
            <div style={{ padding: '0 20px 20px 20px' }}>
                <div style={{ background: '#111', padding: 18, borderRadius: 6 }}>
                    {q?.question || 'Loading...'}
                </div>

                {/* ANSWER BOX + MIC BUTTON */}
                {!waitingNext && (
                    <>
                        <textarea
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                            placeholder="Type your answer here or use the mic 🎤"
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                marginTop: 10,
                                padding: 10,
                                background: '#000',
                                color: '#fff',
                                border: '1px solid #333',
                                borderRadius: 6,
                                minHeight: 120,
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                fontSize: 14,
                                lineHeight: 1.5
                            }}
                        />
                        {/* MIC BUTTON row */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                            <VoiceInput onTranscript={(t) => setAnswer(prev => prev ? prev + ' ' + t : t)} />
                        </div>
                    </>
                )}

                {/* SUBMIT + SKIP */}
                {!waitingNext && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                        <button
                            onClick={handleSubmit}
                            disabled={evaluating}
                            style={{
                                flex: 1, padding: 12,
                                background: evaluating ? '#555' : '#6c63ff',
                                color: '#fff', border: 'none', borderRadius: 6,
                                cursor: evaluating ? 'not-allowed' : 'pointer',
                                fontWeight: 600, transition: 'background 0.2s'
                            }}
                        >
                            {evaluating ? 'Evaluating...' : 'Submit'}
                        </button>
                        <button
                            onClick={handleSkip}
                            disabled={evaluating}
                            style={{
                                flex: 1, padding: 12,
                                background: evaluating ? '#333' : '#444',
                                color: evaluating ? '#888' : '#fff',
                                border: 'none', borderRadius: 6,
                                cursor: evaluating ? 'not-allowed' : 'pointer',
                                fontWeight: 600, transition: 'background 0.2s'
                            }}
                        >
                            Skip
                        </button>
                    </div>
                )}

                {/* FEEDBACK CARD */}
                {waitingNext && lastFeedback && theme && (
                    <div style={{
                        marginTop: 15, padding: 16,
                        background: theme.bg, border: `1px solid ${theme.border}`,
                        borderRadius: 8, transition: 'all 0.3s'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <span style={{ background: theme.accent, color: '#000', fontWeight: 700, borderRadius: 4, padding: '3px 10px', fontSize: 13 }}>
                                {theme.label}
                            </span>
                            <span style={{ color: theme.accent, fontWeight: 700, fontSize: 18 }}>
                                {lastFeedback.score} / 10
                            </span>
                        </div>
                        <div style={{ color: '#ddd', fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
                            {lastFeedback.feedback}
                        </div>
                        <button
                            onClick={handleNext}
                            style={{
                                width: '100%', padding: 12,
                                background: theme.accent, color: '#000',
                                fontWeight: 700, border: 'none', borderRadius: 6,
                                cursor: 'pointer', fontSize: 14, transition: 'opacity 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                            onMouseOut={e => e.currentTarget.style.opacity = '1'}
                        >
                            {current + 1 >= questions.length ? 'Finish Exam →' : 'Next Question →'}
                        </button>
                    </div>
                )}

                {/* FINISH BUTTON */}
                <button
                    onClick={() => finishExam(answersRef.current)}
                    style={{
                        width: '100%', marginTop: 15, padding: 14,
                        background: 'orange', color: '#000',
                        fontWeight: 700, border: 'none', borderRadius: 6,
                        cursor: 'pointer', fontSize: 15
                    }}
                >
                    Finish Exam
                </button>
            </div>
        </div>
    )
}
