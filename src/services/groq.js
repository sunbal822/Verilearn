const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'
const KEY = import.meta.env.VITE_GROQ_API_KEY

async function ask(messages, json = false) {
    const res = await fetch(GROQ_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${KEY}`
        },
        body: JSON.stringify({
            model: MODEL,
            messages,
            temperature: 0.6,
            max_tokens: 1200,
            ...(json && { response_format: { type: 'json_object' } })
        })
    })

    const data = await res.json()
    return data.choices?.[0]?.message?.content || ''
}

// ------------------------------
// QUESTIONS GENERATION
// ------------------------------
export async function generateQuestions(fileContent, subject) {
    const prompt = `
You are an academic examiner.

Generate 10 viva questions:
- 4 Easy
- 3 Medium
- 3 Hard

Subject: ${subject}

Content:
${fileContent.slice(0, 3000)}

Return ONLY JSON:
{
  "questions": [
    {"question": "...", "difficulty": "Easy"}
  ]
}
`

    try {
        const raw = await ask([{ role: 'user', content: prompt }], true)
        return JSON.parse(raw).questions
    } catch (e) {
        return fallbackQuestions(subject)
    }
}

// ------------------------------
// ANSWER EVALUATION (FAIR MARKING)
// ------------------------------
export async function evaluateAnswer(question, answer, difficulty) {
    const prompt = `
You are a FAIR university examiner.

DO NOT be strict about grammar.

Scoring rules:
0–3 = poor
4–6 = partial understanding
7–10 = good understanding

Question: ${question}
Difficulty: ${difficulty}
Answer: ${answer}

Return ONLY JSON:
{
  "score": number (0-10),
  "feedback": "short explanation"
}
`

    try {
        const raw = await ask([{ role: 'user', content: prompt }], true)
        const parsed = JSON.parse(raw)

        return {
            score: Math.max(0, Math.min(10, Number(parsed.score || 0))),
            feedback: parsed.feedback || "No feedback"
        }

    } catch (e) {
        return {
            score: 0,
            feedback: "Evaluation failed"
        }
    }
}

// ------------------------------
// FALLBACK QUESTIONS
// ------------------------------
function fallbackQuestions(subject) {
    return [
        { question: `What is ${subject}?`, difficulty: 'Easy' },
        { question: `Explain basic concepts of ${subject}`, difficulty: 'Easy' },
        { question: `Applications of ${subject}`, difficulty: 'Medium' },
        { question: `Limitations of ${subject}`, difficulty: 'Hard' },
    ]
}