import { Router } from 'express'
import { runCode } from '../controllers/runController'

const router = Router()

router.post('/:id', runCode)

export default router
