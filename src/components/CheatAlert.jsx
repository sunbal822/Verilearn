import { useEffect } from 'react'
import { saveRecord } from '../utils/storage'

export default function CheatAlert({ studentData }) {

    useEffect(() => {
        if (!studentData) return

        const failedRecord = {
            name: studentData.name,
            rollId: studentData.rollId,
            subject: studentData.subject || 'Unknown',
            score: 0,
            max: 0,
            percentage: 0,
            grade: 'F',
            status: 'FLAGGED — AUTOMATIC FAIL',
            timestamp: new Date().toISOString()
        }

        saveRecord(failedRecord)

    }, [studentData])

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0b0000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            padding: 24
        }}>
            <div>
                <div style={{ fontSize: 70 }}>🚫</div>

                <h1 style={{ color: '#ff4757', fontSize: 36, marginBottom: 10 }}>
                    Integrity Violation
                </h1>

                <p style={{ opacity: 0.7, maxWidth: 400 }}>
                    Cheating detected. This attempt has been automatically failed and recorded.
                </p>

                <div style={{
                    marginTop: 20,
                    padding: 12,
                    border: '1px solid #ff4757',
                    borderRadius: 10,
                    color: '#ff4757'
                }}>
                    RESULT: AUTOMATIC FAIL (0 MARKS)
                </div>
            </div>
        </div>
    )
}