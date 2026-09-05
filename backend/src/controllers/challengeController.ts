import { Request, Response } from 'express'
import challenges from '../data/challenges.json'

export function getChallenge(req: Request, res: Response) {
	const challenge = challenges[0]

	if (!challenge) {
		return res.status(404).json({ error: 'Challenge not found' })
	}

	res.json({
		id: challenge.id,
		title: challenge.title,
		description: challenge.description,
		language: challenge.language,
		starterCode: challenge.starterCode,
		visibleTestCases: challenge.testCases
			.filter((tc) => !tc.hidden)
			.map((tc) => ({ input: tc.input, expectedOutput: tc.expectedOutput }))
	})
}
