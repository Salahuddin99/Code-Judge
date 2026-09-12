import { Request, Response } from 'express'
import { Challenge } from '../models/Challenge'
import { Submission } from '../models/Submission'
import { runAllTests } from '../services/testRunnerService'

// POST /api/submit/:id
export async function submitCode(req: Request, res: Response) {
  const { id } = req.params
  const { code } = req.body

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'No code provided' })
  }

  try {
    const challenge = await Challenge.findById(id)

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

    // Save this attempt permanently, linked to the challenge —
    // this is what lets the creator see every candidate's submission later
    await Submission.create({
      challengeId: challenge._id,
      code,
      allPassed,
      results: sanitizedResults,
    })

    res.json({ allPassed, results: sanitizedResults })
  } catch (error: any) {
    console.error('Error submitting code:', error.message)
    res.status(500).json({ error: 'Failed to execute code' })
  }
}
