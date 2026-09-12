import { Router } from 'express'
import { submitCode } from '../controllers/submitController'

const router = Router()

router.post('/:id', submitCode)

export default router
