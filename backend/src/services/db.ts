import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('MONGODB_URI is not set in .env')
  }

  try {
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')
  } catch (error: any) {
    console.error('Failed to connect to MongoDB:', error.message)
    process.exit(1)
  }
}
