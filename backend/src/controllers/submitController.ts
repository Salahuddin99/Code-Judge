import { Request, Response } from 'express'
import { runAllTests } from '../services/testRunnerService'
import challenges from '../data/challenges.json'

export async function submitCode(req: Request, res: Response) {
  const { code } = req.body

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'No code provided' })
  }

  try {
    const challenge = challenges[0]
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' })
    }

    const results = await runAllTests(code, challenge.testCases)
    const allPassed = results.every((r) => r.passed)

    const sanitizedResults = results.map((r, index) => ({
      testNumber: index + 1,
      passed: r.passed,
      hidden: challenge.testCases[index]?.hidden ?? false,
    }))

    res.json({ allPassed, results: sanitizedResults })
  } catch (error: any) {
    console.error('Error submitting code:', error.message)
    res.status(500).json({ error: 'Failed to execute code' })
  }
}
