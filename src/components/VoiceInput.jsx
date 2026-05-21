import { useState, useRef } from 'react'

export default function VoiceInput({ onTranscript }) {
    const [listening, setListening] = useState(false)
    const [supported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    const recog = useRef(null)

    const toggle = () => {
        if (!supported) { alert('Use Chrome or Edge for voice input.'); return }
        if (listening) { recog.current?.stop(); setListening(false); return }
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition
        recog.current = new SR()
        recog.current.lang = 'en-US'
        recog.current.interimResults = true
        recog.current.onresult = (e) => {
            const t = Array.from(e.results).map(r => r[0].transcript).join('')
            if (e.results[e.results.length - 1].isFinal) { onTranscript(t); setListening(false) }
        }
        recog.current.onerror = () => setListening(false)
        recog.current.onend = () => setListening(false)
        recog.current.start()
        setListening(true)
    }

    return (
        <button onClick={toggle} title={listening ? 'Stop' : 'Speak your answer'} style={{ width: 52, height: 52, borderRadius: '50%', background: listening ? 'linear-gradient(135deg, var(--danger), #ff6b6b)' : 'var(--surface2)', border: listening ? '2px solid rgba(255,71,87,0.5)' : '1.5px solid var(--border)', color: listening ? '#fff' : 'var(--text2)', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: listening ? 'pulse 1s ease-in-out infinite' : 'none', boxShadow: listening ? '0 0 20px rgba(255,71,87,0.4)' : 'none' }}>
            {listening ? '⏹' : '🎤'}
        </button>
    )
}