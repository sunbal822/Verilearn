import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'

const MODELS_URL = '/models'
const MATCH_THRESHOLD = 0.45  // lower = stricter. 0.45 is a good balance.

export default function FaceVerify({ username, onVerified, onFailed, onSkip }) {
    const videoRef = useRef(null)
    const streamRef = useRef(null)

    const [status, setStatus] = useState('loading') // loading | ready | detecting | error
    const [message, setMessage] = useState('Loading face models...')
    const [countdown, setCountdown] = useState(null)
    const [attempts, setAttempts] = useState(0)

    useEffect(() => {
        let cancelled = false

        async function init() {
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL),
                ])
                if (cancelled) return
                setMessage('Camera starting...')
                const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
                streamRef.current = stream
                if (videoRef.current) videoRef.current.srcObject = stream
                setStatus('ready')
                setMessage('Look at the camera, then click Verify.')
            } catch (e) {
                if (!cancelled) {
                    setStatus('error')
                    setMessage('Camera or model error: ' + e.message)
                }
            }
        }

        init()
        return () => {
            cancelled = true
            stopCamera()
        }
    }, [])

    function stopCamera() {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
            streamRef.current = null
        }
    }

    async function handleVerify() {
        if (status !== 'ready') return

        // Check stored descriptor exists
        const key = `face_descriptor_${username.toLowerCase()}`
        const stored = localStorage.getItem(key)
        if (!stored) {
            // No face enrolled — let them through (they skipped enrollment)
            stopCamera()
            onVerified()
            return
        }

        setStatus('detecting')
        setMessage('Hold still...')

        for (let i = 3; i >= 1; i--) {
            setCountdown(i)
            await new Promise(r => setTimeout(r, 1000))
        }
        setCountdown(null)

        try {
            const detection = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor()

            if (!detection) {
                const newAttempts = attempts + 1
                setAttempts(newAttempts)
                setStatus('ready')
                setMessage(`No face detected. Make sure you're well-lit. (Attempt ${newAttempts}/3)`)
                if (newAttempts >= 3) {
                    setMessage('Too many failed attempts. Use password login below.')
                    onFailed()
                }
                return
            }

            const storedDescriptor = new Float32Array(JSON.parse(stored))
            const distance = faceapi.euclideanDistance(detection.descriptor, storedDescriptor)

            if (distance <= MATCH_THRESHOLD) {
                setStatus('done')
                setMessage('Identity verified! ✓')
                stopCamera()
                setTimeout(() => onVerified(), 900)
            } else {
                const newAttempts = attempts + 1
                setAttempts(newAttempts)
                setStatus('ready')
                setMessage(`Face didn't match. Try again in better lighting. (Attempt ${newAttempts}/3)`)
                if (newAttempts >= 3) {
                    stopCamera()
                    onFailed()
                }
            }
        } catch (e) {
            setStatus('ready')
            setMessage('Detection error. Try again. ' + e.message)
        }
    }

    const btnDisabled = status !== 'ready'

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            padding: '20px 0'
        }}>
            <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', maxWidth: 340 }}>
                Verify your identity with your face to log in.
            </p>

            {/* Video */}
            <div style={{
                position: 'relative', width: 280, height: 210,
                borderRadius: 12, overflow: 'hidden',
                border: status === 'done' ? '2px solid #00d4aa' : '2px solid #333',
                background: '#0a0a0a'
            }}>
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />

                {countdown !== null && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.45)'
                    }}>
                        <span style={{ fontSize: 72, fontWeight: 800, color: '#ff9800' }}>{countdown}</span>
                    </div>
                )}

                {status === 'done' && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.55)'
                    }}>
                        <span style={{ fontSize: 52 }}>✅</span>
                    </div>
                )}
            </div>

            <p style={{
                fontSize: 13,
                color: status === 'error' ? '#ff4757'
                    : status === 'done' ? '#00d4aa'
                        : message.includes("didn't match") || message.includes('failed') ? '#ff4757'
                            : '#aaa',
                textAlign: 'center', maxWidth: 300
            }}>
                {message}
            </p>

            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                <button
                    onClick={() => { stopCamera(); onSkip() }}
                    style={{
                        flex: 1, padding: '11px 0',
                        background: 'transparent', color: '#666',
                        border: '1px solid #333', borderRadius: 8,
                        fontSize: 13, cursor: 'pointer', fontWeight: 600
                    }}
                >
                    Use Password
                </button>
                <button
                    onClick={handleVerify}
                    disabled={btnDisabled}
                    style={{
                        flex: 2, padding: '11px 0',
                        background: btnDisabled ? '#333' : '#6c63ff',
                        color: btnDisabled ? '#666' : '#fff',
                        border: 'none', borderRadius: 8,
                        fontSize: 14, fontWeight: 700,
                        cursor: btnDisabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {status === 'detecting' ? 'Verifying...' : '🔍 Verify Face'}
                </button>
            </div>
        </div>
    )
}
