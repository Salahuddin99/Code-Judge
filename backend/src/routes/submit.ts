import { Router } from 'express'
import { submitCode } from '../controllers/submitController'

const router = Router()

router.post('/', submitCode)

export default router
