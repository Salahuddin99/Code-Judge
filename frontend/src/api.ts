import axios from 'axios'

const API_BASE = 'http://localhost:3000/api'

export interface TestCaseInput {
  input: string
  expectedOutput: string
  hidden: boolean
}

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

export interface CreateChallengePayload {
  title: string
  description: string
  language: string
  starterCode: string
  testCases: TestCaseInput[]
}

export interface Submission {
  id: string
  code: string
  allPassed: boolean
  results: { testNumber: number; passed: boolean; hidden: boolean }[]
  submittedAt: string
}

export async function createChallenge(
  payload: CreateChallengePayload,
): Promise<{ id: string; shareableLink: string }> {
  const response = await axios.post(`${API_BASE}/challenges`, payload)
  return response.data
}

export async function fetchChallenge(id: string): Promise<Challenge> {
  const response = await axios.get(`${API_BASE}/challenges/${id}`)
  return response.data
}

export async function runCode(
  id: string,
  code: string,
): Promise<{ results: RunResult[] }> {
  const response = await axios.post(`${API_BASE}/run/${id}`, { code })
  return response.data
}

export async function submitCode(
  id: string,
  code: string,
): Promise<SubmitResult> {
  const response = await axios.post(`${API_BASE}/submit/${id}`, { code })
  return response.data
}

export async function fetchSubmissions(
  id: string,
): Promise<{ challengeTitle: string; submissions: Submission[] }> {
  const response = await axios.get(`${API_BASE}/challenges/${id}/submissions`)
  return response.data
}
