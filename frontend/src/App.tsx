import { useEffect, useState } from 'react'
import { fetchChallenge, runCode, submitCode } from './api'
import type { Challenge, RunResult, SubmitResult } from './api'
import './App.css'

function App() {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [runResults, setRunResults] = useState<RunResult[] | null>(null)
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChallenge()
      .then((data) => {
        setChallenge(data)
        setCode(data.starterCode)
      })
      .catch(() =>
        setError('Could not load challenge. Is the backend running?'),
      )
  }, [])

  async function handleRun() {
    setLoading(true)
    setError(null)
    setSubmitResult(null)
    try {
      const data = await runCode(code)
      setRunResults(data.results)
    } catch (err) {
      setError(
        'Failed to run code. Check that the backend and Piston are running.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    setRunResults(null)
    try {
      const data = await submitCode(code)
      setSubmitResult(data)
    } catch (err) {
      setError(
        'Failed to submit code. Check that the backend and Piston are running.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (!challenge && !error) {
    return <div className="container">Loading challenge...</div>
  }

  return (
    <div className="container">
      <h1>Code Judge</h1>

      {error && <div className="error-banner">{error}</div>}

      {challenge && (
        <>
          <div className="challenge-header">
            <h2>{challenge.title}</h2>
            <p>{challenge.description}</p>
          </div>

          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />

          <div className="button-row">
            <button onClick={handleRun} disabled={loading}>
              {loading ? 'Running...' : 'Run'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="submit-btn"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>

          {runResults && (
            <div className="results-panel">
              <h3>Run Results</h3>
              {runResults.map((r, i) => (
                <div
                  key={i}
                  className={`result-row ${r.passed ? 'pass' : 'fail'}`}
                >
                  <span className="status">{r.passed ? 'Pass' : 'Fail'}</span>
                  <span className="detail">
                    Input: {r.input} — Got: {r.actualOutput}
                  </span>
                  {r.error && <div className="error-text">{r.error}</div>}
                </div>
              ))}
            </div>
          )}

          {submitResult && (
            <div className="results-panel">
              <h3>
                {submitResult.allPassed
                  ? 'All tests passed!'
                  : 'Some tests failed'}
              </h3>
              {submitResult.results.map((r) => (
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
          )}
        </>
      )}
    </div>
  )
}

export default App
