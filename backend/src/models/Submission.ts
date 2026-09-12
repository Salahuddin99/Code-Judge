import mongoose, { Schema, Document } from 'mongoose'

// The full shape of a Submission document in MongoDB
// One of these gets created every time a candidate clicks "Submit"
export interface SubmissionDocument extends Document {
  challengeId: mongoose.Types.ObjectId
  code: string
  allPassed: boolean
  results: {
    testNumber: number
    passed: boolean
    hidden: boolean
  }[]
  submittedAt: Date
}

const SubmissionSchema = new Schema<SubmissionDocument>({
  // Links this submission back to the challenge it belongs to
  challengeId: {
    type: Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
  },
  code: { type: String, required: true },
  allPassed: { type: Boolean, required: true },
  results: [
    {
      testNumber: { type: Number, required: true },
      passed: { type: Boolean, required: true },
      hidden: { type: Boolean, required: true },
      _id: false,
    },
  ],
  submittedAt: { type: Date, default: Date.now },
})

export const Submission = mongoose.model<SubmissionDocument>(
  'Submission',
  SubmissionSchema,
)
