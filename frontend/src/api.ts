import axios from 'axios'

const API_BASE = 'http://localhost:3000/api'

export interface Challenge {
  id: string
  title: string
  description: string
  language: string
  starterCode: string
  visibleTestCases: { input: string; expectedOutput: string }[]
}

export interface RunResult {
  input: string
  passed: boolean
  actualOutput: string
  error: string | null
}

export interface SubmitResult {
  allPassed: boolean
  results: { testNumber: number; passed: boolean; hidden: boolean }[]
}

export async function fetchChallenge(): Promise<Challenge> {
  const response = await axios.get(`${API_BASE}/challenge`)
  return response.data
}

export async function runCode(code: string): Promise<{ results: RunResult[] }> {
  const response = await axios.post(`${API_BASE}/run`, { code })
  return response.data
}

export async function submitCode(code: string): Promise<SubmitResult> {
  const response = await axios.post(`${API_BASE}/submit`, { code })
  return response.data
}
