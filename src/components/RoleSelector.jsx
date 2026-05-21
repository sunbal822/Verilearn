export default function RoleSelector({ onSelect }) {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            color: '#fff'
        }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
                VeriLearn
            </h1>
            <p style={{ color: '#888', marginBottom: 40, textAlign: 'center' }}>
                Select your role to continue
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 360 }}>

                {/* STUDENT */}
                <button
                    onClick={() => onSelect('student')}
                    style={{
                        padding: '22px 20px',
                        background: '#111',
                        border: '1px solid #333',
                        borderRadius: 12,
                        color: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'border-color 0.2s, background 0.2s'
                    }}
                    onMouseOver={e => {
                        e.currentTarget.style.borderColor = '#6c63ff'
                        e.currentTarget.style.background = '#1a1a2e'
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.borderColor = '#333'
                        e.currentTarget.style.background = '#111'
                    }}
                >
                    <div style={{ fontSize: 22, marginBottom: 6 }}>🎓</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Student</div>
                    <div style={{ color: '#888', fontSize: 13 }}>Take a viva exam on your uploaded material</div>
                </button>

                {/* PROFESSOR */}
                <button
                    onClick={() => onSelect('professor')}
                    style={{
                        padding: '22px 20px',
                        background: '#111',
                        border: '1px solid #333',
                        borderRadius: 12,
                        color: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'border-color 0.2s, background 0.2s'
                    }}
                    onMouseOver={e => {
                        e.currentTarget.style.borderColor = '#ff9800'
                        e.currentTarget.style.background = '#1f1600'
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.borderColor = '#333'
                        e.currentTarget.style.background = '#111'
                    }}
                >
                    <div style={{ fontSize: 22, marginBottom: 6 }}>🧑‍🏫</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Professor</div>
                    <div style={{ color: '#888', fontSize: 13 }}>View student results by subject</div>
                </button>
            </div>
        </div>
    )
}
