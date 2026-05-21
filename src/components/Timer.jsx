import { useState, useEffect, useRef } from 'react'

export default function Timer({ totalSeconds = 120, onTimeout }) {
    const [remaining, setRemaining] = useState(totalSeconds)
    const fired = useRef(false)

    useEffect(() => {
        if (remaining <= 0 && !fired.current) {
            fired.current = true
            onTimeout()
            return
        }

        const t = setTimeout(() => setRemaining(r => r - 1), 1000)
        return () => clearTimeout(t)
    }, [remaining])

    return <div>⏱ {remaining}s</div>
}