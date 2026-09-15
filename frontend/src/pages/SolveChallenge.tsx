import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CodeMirror from '@uiw/react-codemirror'
import { langs } from '@uiw/codemirror-extensions-langs'
import { oneDark } from '@codemirror/theme-one-dark'
import { fetchChallenge, runCode, submitCode } from '../api'
import type { Challenge, RunResult, SubmitResult } from '../api'

// Maps the language string stored in MongoDB to the matching CodeMirror
// syntax-highlighting extension. Centralized here so both this page and
// the create page can share the exact same mapping.
function getLanguageExtension(language: string) {
  switch (language) {
    case 'python':
      return langs.python()
    case 'c++':
      return langs.cpp()
    case 'c#':
      return langs.cs()
    case 'javascript':
    default:
      return langs.js()
  }
}

function SolveChallenge() {
  const { id } = useParams<{ id: string }>()

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [runResults, setRunResults] = useState<RunResult[] | null>(null)
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    fetchChallenge(id)
      .then((data) => {
        setChallenge(data)
        setCode(data.starterCode)
      })
      .catch(() =>
        setError('Could not load this challenge. The link may be invalid.'),
      )
  }, [id])

  async function handleRun() {
    if (!id) return
    setLoading(true)
    setError(null)
    setSubmitResult(null)
    try {
      const data = await runCode(id, code)
      setRunResults(data.results)
    } catch (err) {
      setError('Failed to run code. Check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!id) return
    setLoading(true)
    setError(null)
    setRunResults(null)
    try {
      const data = await submitCode(id, code)
      setSubmitResult(data)
    } catch (err) {
      setError('Failed to submit code. Check that the backend is running.')
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

          <div className="editor-wrapper">
            <CodeMirror
              value={code}
              height="320px"
              theme={oneDark}
              extensions={[getLanguageExtension(challenge.language)]}
              onChange={(value) => setCode(value)}
              basicSetup={{
                tabSize: 2,
              }}
            />
          </div>

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

export default SolveChallenge
