import axios from 'axios'

const PISTON_URL = 'http://localhost:2000/api/v2/execute'

// The shape of what we send Piston
interface ExecuteRequest {
  code: string
  input?: string // stdin, if a challenge needs it later
}

// The shape of what we care about from Piston's response
interface ExecuteResult {
  stdout: string
  stderr: string
  exitCode: number
}

/**
 * Sends a piece of JavaScript code to the local Piston container for execution.
 * Piston handles sandboxing — this function never runs user code itself,
 * it only brokers the request and returns the result.
 */
export async function executeCode({
  code,
  input,
}: ExecuteRequest): Promise<ExecuteResult> {
  try {
    // Automatically give the candidate's code access to a plain `input` variable,
    // so they never need to know about stdin/readFileSync themselves.
    const wrappedCode = `const input = require('fs').readFileSync(0, 'utf-8').trim();\n${code}`

    const response = await axios.post(PISTON_URL, {
      language: 'javascript',
      version: '20.11.1',
      files: [
        {
          name: 'main.js',
          content: wrappedCode,
        },
      ],
      stdin: input ?? '',
    })

    const run = response.data.run

    return {
      stdout: response.data.run.stdout,
      stderr: response.data.run.stderr,
      exitCode: response.data.run.code,
    }
  } catch (error: any) {
    // Piston itself failed to respond (container down, network issue, etc.)
    // This is different from the USER's code failing — that comes back as stderr, not an exception here.
    throw new Error(`Failed to reach code execution service: ${error.message}`)
  }
}
