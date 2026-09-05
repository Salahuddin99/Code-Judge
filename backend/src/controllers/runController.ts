import { Request, Response } from 'express'
import { runVisibleTests } from '../services/testRunnerService'
import challenges from '../data/challenges.json'

export async function runCode(req: Request, res: Response) {
  const { code } = req.body

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'No code provided' })
  }

  try {
    // For now, always use the first (and only) challenge.
    // Once you have multiple challenges, this would use a challenge ID from the request.
    const challenge = challenges[0]

    if (!challenge) {
      //
      return res.status(404).json({ error: 'Challenge not found' }) //added by ai chat not claude
    } //

    const results = await runVisibleTests(code, challenge.testCases)

    res.json({ results })
  } catch (error: any) {
    console.error('Error running code:', error.message)
    res.status(500).json({ error: 'Failed to execute code' })
  }
}
