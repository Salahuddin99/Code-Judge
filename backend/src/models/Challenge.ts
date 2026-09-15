import mongoose, { Schema, Document } from 'mongoose'
import type { SupportedLanguage } from '../types/Language'
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
  language: SupportedLanguage
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
  { _id: false },
)

const ChallengeSchema = new Schema<ChallengeDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  // `enum` tells MongoDB itself to reject any language outside this list —
  // this is enforced at the database level, not just in TypeScript.
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'c++', 'c#'],
    default: 'javascript',
  },
  starterCode: { type: String, required: true },
  testCases: { type: [TestCaseSchema], required: true },
  createdAt: { type: Date, default: Date.now },
})

export const Challenge = mongoose.model<ChallengeDocument>(
  'Challenge',
  ChallengeSchema,
)
