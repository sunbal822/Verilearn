import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'

const MODELS_URL = '/models'

export default function FaceEnroll({ username, onEnrolled, onSkip }) {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)

    const [status, setStatus] = useState('loading') // loading | ready | detecting | done | error
    const [message, setMessage] = useState('Loading face models...')
    const [countdown, setCountdown] = useState(null)

    // Load models then start camera
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
                setMessage('Position your face in the frame, then click Enroll.')
            } catch (e) {
                if (!cancelled) {
                    setStatus('error')
                    setMessage('Could not load models or camera. ' + e.message)
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

    async function handleEnroll() {
        if (status !== 'ready') return
        setStatus('detecting')
        setMessage('Hold still...')

        // 3-second countdown
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
                setStatus('ready')
                setMessage('No face detected. Make sure your face is well-lit and visible.')
                return
            }

            // Store descriptor as array in localStorage keyed by username
            const descriptor = Array.from(detection.descriptor)
            const key = `face_descriptor_${username.toLowerCase()}`
            localStorage.setItem(key, JSON.stringify(descriptor))

            setStatus('done')
            setMessage('Face enrolled successfully!')
            stopCamera()
            setTimeout(() => onEnrolled(), 1200)
        } catch (e) {
            setStatus('ready')
            setMessage('Error during detection. Try again. ' + e.message)
        }
    }

    const btnDisabled = status !== 'ready'

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            padding: '20px 0'
        }}>
            <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', maxWidth: 340 }}>
                Enroll your face so the system can verify your identity on future logins.
            </p>

            {/* Video box */}
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
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* Countdown overlay */}
                {countdown !== null && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.45)'
                    }}>
                        <span style={{ fontSize: 72, fontWeight: 800, color: '#ff9800' }}>{countdown}</span>
                    </div>
                )}

                {/* Done overlay */}
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

            {/* Status message */}
            <p style={{
                fontSize: 13,
                color: status === 'error' ? '#ff4757' : status === 'done' ? '#00d4aa' : '#aaa',
                textAlign: 'center', maxWidth: 300
            }}>
                {message}
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                <button
                    onClick={onSkip}
                    style={{
                        flex: 1, padding: '11px 0',
                        background: 'transparent', color: '#666',
                        border: '1px solid #333', borderRadius: 8,
                        fontSize: 13, cursor: 'pointer', fontWeight: 600
                    }}
                >
                    Skip for now
                </button>
                <button
                    onClick={handleEnroll}
                    disabled={btnDisabled}
                    style={{
                        flex: 2, padding: '11px 0',
                        background: btnDisabled ? '#333' : '#ff9800',
                        color: btnDisabled ? '#666' : '#000',
                        border: 'none', borderRadius: 8,
                        fontSize: 14, fontWeight: 700,
                        cursor: btnDisabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {status === 'detecting' ? 'Capturing...' : '📸 Enroll Face'}
                </button>
            </div>
        </div>
    )
}
