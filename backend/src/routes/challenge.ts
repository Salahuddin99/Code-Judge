import { Router } from 'express'
import {
  createChallenge,
  getChallenge,
} from '../controllers/challengeController'
import { getSubmissions } from '../controllers/submissionController'

const router = Router()

router.post('/', createChallenge)
router.get('/:id', getChallenge)
router.get('/:id/submissions', getSubmissions)

export default router
