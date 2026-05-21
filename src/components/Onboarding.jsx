import { useState, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist/build/pdf'
import mammoth from 'mammoth'

pdfjsLib.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export default function Onboarding({ onSubmit }) {

    const [name, setName] = useState('')
    const [rollId, setRollId] = useState('')
    const [subject, setSubject] = useState('')
    const [fileContent, setFileContent] = useState('')
    const [fileName, setFileName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const fileRef = useRef()

    const extractText = async (file) => {
        const ext = file.name.split('.').pop().toLowerCase()

        try {
            // TXT / PY / MD / JS
            if (['txt', 'py', 'js', 'md', 'json', 'html', 'css'].includes(ext)) {
                return await file.text()
            }

            // PDF (FIXED + safer)
            if (ext === 'pdf') {
                const arrayBuffer = await file.arrayBuffer()

                const pdf = await pdfjsLib.getDocument({
                    data: arrayBuffer,
                    disableWorker: true // 🔥 avoids worker issues
                }).promise

                let text = ''

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i)
                    const content = await page.getTextContent()
                    text += content.items.map(item => item.str).join(' ') + '\n'
                }

                return text
            }

            // DOCX
            if (ext === 'docx') {
                const arrayBuffer = await file.arrayBuffer()
                const result = await mammoth.extractRawText({ arrayBuffer })
                return result.value
            }

            throw new Error('Unsupported file type')
        } catch (err) {
            console.error(err)
            throw new Error('File reading failed')
        }
    }

    const handleFile = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setFileName(file.name)
        setError('')

        try {
            const text = await extractText(file)
            setFileContent(text)
        } catch (err) {
            setError('Failed to read file. Use TXT, PDF, or DOCX.')
        }
    }

    const handleSubmit = async () => {
        if (!name.trim()) return setError('Enter your name')
        if (!rollId.trim()) return setError('Enter Roll ID')
        if (!subject.trim()) return setError('Enter subject')
        if (!fileContent.trim()) return setError('Upload or paste content')

        setError('')
        setLoading(true)

        await onSubmit({
            name: name.trim(),
            rollId: rollId.trim(),
            subject: subject.trim(),
            fileContent
        })
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            color: '#fff'
        }}>

            <div style={{
                width: '100%',
                maxWidth: 520,
                background: '#111',
                padding: 30,
                borderRadius: 12,
                boxShadow: '0 0 20px rgba(0,0,0,0.6)'
            }}>

                {/* TITLE */}
                <h2 style={{ marginBottom: 20, textAlign: 'center' }}>
                    Student Setup
                </h2>

                {/* INPUTS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                    <input
                        placeholder="Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={inputStyle}
                    />

                    <input
                        placeholder="Roll ID"
                        value={rollId}
                        onChange={e => setRollId(e.target.value)}
                        style={inputStyle}
                    />

                    <input
                        placeholder="Subject"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                {/* FILE UPLOAD */}
                <div
                    onClick={() => fileRef.current.click()}
                    style={{
                        marginTop: 15,
                        padding: 18,
                        border: '1px dashed #555',
                        borderRadius: 8,
                        cursor: 'pointer',
                        textAlign: 'center',
                        color: '#aaa'
                    }}
                >
                    {fileName || "Click to upload PDF / DOCX / TXT"}
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".txt,.pdf,.docx"
                        onChange={handleFile}
                        hidden
                    />
                </div>

                {/* TEXT AREA */}
                <textarea
                    value={fileContent}
                    onChange={e => setFileContent(e.target.value)}
                    placeholder="Or paste text here..."
                    style={{
                        width: '100%',
                        height: 140,
                        marginTop: 15,
                        padding: 10,
                        background: '#000',
                        color: '#fff',
                        border: '1px solid #333',
                        borderRadius: 6,
                        resize: 'none'
                    }}
                />

                {/* ERROR */}
                {error && (
                    <p style={{
                        color: 'red',
                        marginTop: 10,
                        fontSize: 13
                    }}>
                        {error}
                    </p>
                )}

                {/* BUTTON */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                        width: '100%',
                        marginTop: 15,
                        padding: 14,
                        background: loading ? '#555' : '#6c63ff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    {loading ? 'Loading...' : 'Start Viva'}
                </button>

            </div>
        </div>
    )
}

const inputStyle = {
    padding: 12,
    background: '#000',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: 6,
    outline: 'none'
}