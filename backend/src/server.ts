import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { connectDB } from './services/db'
import runRoute from './routes/run'
import challengeRoute from './routes/challenge'
import submitRoute from './routes/submit'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/run', runRoute)
app.use('/api/challenges', challengeRoute)
app.use('/api/submit', submitRoute)

app.get('/', (req, res) => {
  res.send('Code Judge backend is running')
})

async function start() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

start()
