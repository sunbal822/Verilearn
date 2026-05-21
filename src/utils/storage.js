const KEY = 'verilearn_records'

export const getRecords = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') }
    catch { return [] }
}

export const saveRecord = (record) => {
    const records = getRecords()
    records.unshift(record)
    localStorage.setItem(KEY, JSON.stringify(records))
}

export const clearRecords = () => localStorage.removeItem(KEY)