import { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { langs } from '@uiw/codemirror-extensions-langs'
import { oneDark } from '@codemirror/theme-one-dark'
import { createChallenge } from '../api'
import type { TestCaseInput } from '../api'

// Same mapping as SolveChallenge — kept in sync so a challenge's starter
// code always highlights the same way for both creator and candidate.
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

function getStarterTemplate(language: string) {
  switch (language) {
    case 'python':
      return ''
    case 'c++':
      return 'int main() {\n    \n    return 0;\n}\n'
    case 'c#':
      return 'class Program {\n    static void Main() {\n        \n    }\n}\n'
    case 'javascript':
    default:
      return ''
  }
}

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
        <select
          value={language}
          onChange={(e) => {
            const newLanguage = e.target.value
            setLanguage(newLanguage)
            // Only auto-fill if the starter code is still empty, so we don't
            // overwrite something the creator already started typing.
            if (starterCode.trim() === '') {
              setStarterCode(getStarterTemplate(newLanguage))
            }
          }}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="c++">C++</option>
          <option value="c#">C#</option>
        </select>

        <label>Starter Code (with the bug included)</label>
        <div className="editor-wrapper">
          <CodeMirror
            value={starterCode}
            height="240px"
            theme={oneDark}
            extensions={[getLanguageExtension(language)]}
            onChange={(value) => setStarterCode(value)}
            basicSetup={{
              tabSize: 2,
            }}
          />
        </div>

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
