import mongoose, { Schema, Document } from 'mongoose'

// One test case within a challenge
interface TestCase {
  input: string
  expectedOutput: string
  hidden: boolean
}

// The full shape of a Challenge document in MongoDB
export interface ChallengeDocument extends Document {
  title: string
  description: string
  language: string
  starterCode: string
  testCases: TestCase[]
  createdAt: Date
}

const TestCaseSchema = new Schema<TestCase>(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    hidden: { type: Boolean, required: true, default: false },
  },
  { _id: false }, // test cases don't need their own separate ID
)

const ChallengeSchema = new Schema<ChallengeDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  language: { type: String, required: true, default: 'javascript' },
  starterCode: { type: String, required: true },
  testCases: { type: [TestCaseSchema], required: true },
  createdAt: { type: Date, default: Date.now },
})

// Mongoose automatically gives every document a unique `_id` —
// that _id is what becomes the shareable link's challenge ID.
export const Challenge = mongoose.model<ChallengeDocument>(
  'Challenge',
  ChallengeSchema,
)
