// ─── Keys ────────────────────────────────────────────────────────────────────
const PROFESSORS_KEY = 'viva_professors'       // { username: { passwordHash, subjects[] } }
const RESULTS_KEY = 'viva_results'          // [ { name, rollId, subject, score, max, percentage, date } ]

// ─── Simple hash (not cryptographic — just enough for demo/educational use) ──
function simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
    }
    return hash.toString(16)
}

// ─── Professors ──────────────────────────────────────────────────────────────
export function getProfessors() {
    try { return JSON.parse(localStorage.getItem(PROFESSORS_KEY) || '{}') }
    catch { return {} }
}

export function professorExists(username) {
    return !!getProfessors()[username.toLowerCase()]
}

export function signUpProfessor(username, password, subject) {
    const professors = getProfessors()
    const key = username.toLowerCase()
    if (professors[key]) return { ok: false, error: 'Username already taken' }
    professors[key] = {
        passwordHash: simpleHash(password),
        subjects: subject ? [subject.trim()] : []
    }
    localStorage.setItem(PROFESSORS_KEY, JSON.stringify(professors))
    return { ok: true }
}

export function loginProfessor(username, password) {
    const professors = getProfessors()
    const key = username.toLowerCase()
    const prof = professors[key]
    if (!prof) return { ok: false, error: 'Username not found' }
    if (prof.passwordHash !== simpleHash(password)) return { ok: false, error: 'Wrong password' }
    return { ok: true, professor: { username: key, subjects: prof.subjects } }
}

// ─── Results ─────────────────────────────────────────────────────────────────
export function getResults() {
    try { return JSON.parse(localStorage.getItem(RESULTS_KEY) || '[]') }
    catch { return [] }
}

export function saveResult({ name, rollId, subject, score, max, percentage }) {
    const results = getResults()
    results.push({
        name,
        rollId,
        subject: subject.trim().toLowerCase(),
        score,
        max,
        percentage,
        date: new Date().toLocaleDateString()
    })
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results))
}

export function getResultsBySubject(subject) {
    const all = getResults()
    return all.filter(r => r.subject === subject.trim().toLowerCase())
}
