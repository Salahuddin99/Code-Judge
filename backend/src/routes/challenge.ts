import { Router } from 'express'
import { getChallenge } from '../controllers/challengeController'

const router = Router()

router.get('/', getChallenge)

export default router
