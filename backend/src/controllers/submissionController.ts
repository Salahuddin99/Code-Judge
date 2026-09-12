import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { Submission } from '../models/Submission'
import { Challenge } from '../models/Challenge'

// GET /api/challenges/:id/submissions — creator's view of every attempt
export async function getSubmissions(req: Request, res: Response) {
  const { id } = req.params

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'No challenge id provided' })
  }

  try {
    const challenge = await Challenge.findById(id)
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' })
    }

    // Most recent submissions first
    const submissions = await Submission.find({
      challengeId: new mongoose.Types.ObjectId(id),
    }).sort({ submittedAt: -1 })

    res.json({
      challengeTitle: challenge.title,
      submissions: submissions.map((s) => ({
        id: s._id,
        code: s.code,
        allPassed: s.allPassed,
        results: s.results,
        submittedAt: s.submittedAt,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching submissions:', error.message)
    res.status(500).json({ error: 'Failed to fetch submissions' })
  }
}
