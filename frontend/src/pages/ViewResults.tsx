import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchSubmissions } from '../api'
import type { Submission } from '../api'

function ViewResults() {
  const { id } = useParams<{ id: string }>()

  const [challengeTitle, setChallengeTitle] = useState('')
  const [submissions, setSubmissions] = useState<Submission[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    fetchSubmissions(id)
      .then((data) => {
        setChallengeTitle(data.challengeTitle)
        setSubmissions(data.submissions)
      })
      .catch(() => setError('Could not load results. The link may be invalid.'))
  }, [id])

  if (error) {
    return (
      <div className="container">
        <div className="error-banner">{error}</div>
      </div>
    )
  }

  if (!submissions) {
    return <div className="container">Loading results...</div>
  }

  return (
    <div className="container">
      <h1>Results: {challengeTitle}</h1>

      {submissions.length === 0 && (
        <p>
          No submissions yet. Share the solve link with a candidate to get
          started.
        </p>
      )}

      {submissions.map((s) => (
        <div key={s.id} className="results-panel">
          <h3>
            {s.allPassed ? 'All tests passed' : 'Some tests failed'} —{' '}
            {new Date(s.submittedAt).toLocaleString()}
          </h3>

          <div
            className="code-editor"
            style={{ whiteSpace: 'pre-wrap', minHeight: 'auto' }}
          >
            {s.code}
          </div>

          <div style={{ marginTop: '12px' }}>
            {s.results.map((r) => (
              <div
                key={r.testNumber}
                className={`result-row ${r.passed ? 'pass' : 'fail'}`}
              >
                <span className="status">
                  Test {r.testNumber} {r.hidden ? '(hidden)' : ''}:{' '}
                  {r.passed ? 'Pass' : 'Fail'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ViewResults
