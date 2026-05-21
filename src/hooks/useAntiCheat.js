import { useEffect } from 'react'

export default function useAntiCheat(onCheat) {
    useEffect(() => {
        let triggered = false
        const fire = () => { if (!triggered) { triggered = true; onCheat() } }
        const onBlur = () => fire()
        const onVis = () => { if (document.hidden) fire() }
        window.addEventListener('blur', onBlur)
        document.addEventListener('visibilitychange', onVis)
        return () => {
            window.removeEventListener('blur', onBlur)
            document.removeEventListener('visibilitychange', onVis)
        }
    }, [onCheat])
}