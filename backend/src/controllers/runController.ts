import { Request, Response } from 'express'
import { Challenge } from '../models/Challenge'
import { runVisibleTests } from '../services/testRunnerService'

// POST /api/run/:id
export async function runCode(req: Request, res: Response) {
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

    // challenge.language comes straight from what the creator picked when
    // building this challenge — it determines which Piston runtime runs
    // the candidate's code and which stdin boilerplate gets injected.
    const results = await runVisibleTests(
      code,
      challenge.testCases,
      challenge.language,
    )

    res.json({ results })
  } catch (error: any) {
    console.error('Error running code:', error.message)
    res.status(500).json({ error: 'Failed to execute code' })
  }
}
