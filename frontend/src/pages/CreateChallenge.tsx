import { useState } from 'react'
import { createChallenge } from '../api'
import type { TestCaseInput } from '../api'

function CreateChallenge() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [starterCode, setStarterCode] = useState('')
  const [testCases, setTestCases] = useState<TestCaseInput[]>([
    { input: '', expectedOutput: '', hidden: false },
  ])
  const [shareableLink, setShareableLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateTestCase(
    index: number,
    field: keyof TestCaseInput,
    value: string | boolean,
  ) {
    const updated = [...testCases]
    updated[index] = { ...updated[index], [field]: value }
    setTestCases(updated)
  }

  function addTestCase() {
    setTestCases([
      ...testCases,
      { input: '', expectedOutput: '', hidden: false },
    ])
  }

  function removeTestCase(index: number) {
    setTestCases(testCases.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await createChallenge({
        title,
        description,
        language,
        starterCode,
        testCases,
      })
      const fullLink = `${window.location.origin}/solve/${result.id}`
      setShareableLink(fullLink)
    } catch (err) {
      setError('Failed to create challenge. Check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  if (shareableLink) {
    return (
      <div className="container">
        <h1>Challenge Created</h1>
        <div className="results-panel">
          <p>Share this link with a candidate:</p>
          <div className="link-box">{shareableLink}</div>
          <button onClick={() => navigator.clipboard.writeText(shareableLink)}>
            Copy Link
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Create a Challenge</h1>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Description</label>
        <textarea
          className="text-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label>Language</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="c++">C++</option>
        </select>

        <label>Starter Code (with the bug included)</label>
        <textarea
          className="code-editor"
          value={starterCode}
          onChange={(e) => setStarterCode(e.target.value)}
          spellCheck={false}
          required
        />

        <h3>Test Cases</h3>
        {testCases.map((tc, index) => (
          <div key={index} className="test-case-row">
            <input
              type="text"
              placeholder="Input"
              value={tc.input}
              onChange={(e) => updateTestCase(index, 'input', e.target.value)}
            />
            <input
              type="text"
              placeholder="Expected Output"
              value={tc.expectedOutput}
              onChange={(e) =>
                updateTestCase(index, 'expectedOutput', e.target.value)
              }
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={tc.hidden}
                onChange={(e) =>
                  updateTestCase(index, 'hidden', e.target.checked)
                }
              />
              Hidden
            </label>
            {testCases.length > 1 && (
              <button type="button" onClick={() => removeTestCase(index)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addTestCase}>
          + Add Test Case
        </button>

        <div className="button-row">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Challenge'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateChallenge
