import { useState } from 'react'
import Splash from './components/Splash'
import RoleSelector from './components/RoleSelector'
import Onboarding from './components/Onboarding'
import VivaSession from './components/VivaSession'
import ScoreReport from './components/ScoreReport'
import ProfessorView from './components/ProfessorView'
import { generateQuestions } from './services/groq'

export default function App() {
    const [screen, setScreen] = useState('splash')
    const [studentData, setStudentData] = useState(null)
    const [questions, setQuestions] = useState([])
    const [result, setResult] = useState(null)
    const [answers, setAnswers] = useState([])

    const handleSplashDone = () => setScreen('roleSelect')

    const handleRoleSelect = (role) => {
        if (role === 'student') setScreen('onboarding')
        if (role === 'professor') setScreen('professor')
    }

    const handleOnboardingSubmit = async (data) => {
        setStudentData(data)
        const qs = await generateQuestions(data.fileContent, data.subject)
        setQuestions(qs)
        setScreen('viva')
    }

    const handleVivaComplete = (finalAnswers, scoreData) => {
        setAnswers(finalAnswers)
        setResult(scoreData)
        setScreen('results')
    }

    const handleCheat = (data, finalAnswers) => {
        setAnswers(finalAnswers)
        setResult({ total: 0, max: questions.length * 10 })
        setScreen('results')
    }

    if (screen === 'splash') return <Splash onDone={handleSplashDone} />
    if (screen === 'roleSelect') return <RoleSelector onSelect={handleRoleSelect} />
    if (screen === 'onboarding') return <Onboarding onSubmit={handleOnboardingSubmit} />
    if (screen === 'viva') return <VivaSession questions={questions} studentData={studentData} onComplete={handleVivaComplete} onCheat={handleCheat} />
    if (screen === 'results') return <ScoreReport studentData={studentData} result={result} answers={answers} onRestart={() => { setScreen('roleSelect') }} />
    if (screen === 'professor') return <ProfessorView onBack={() => setScreen('roleSelect')} />

    return null
}
