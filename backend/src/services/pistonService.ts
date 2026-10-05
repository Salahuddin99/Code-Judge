import axios from 'axios'
import type { SupportedLanguage } from '../types/Language'

const PISTON_URL =
  process.env.PISTON_URL || 'http://localhost:2000/api/v2/execute'

interface LanguageConfig {
  pistonLanguage: string
  version: string
  fileName: string
}

// One config per supported language. No boilerplate injection anymore —
// the full code, including any input-reading setup, is now written
// directly in the starter code itself, visible to both creator and candidate.
const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  javascript: {
    pistonLanguage: 'javascript',
    version: '20.11.1',
    fileName: 'main.js',
  },
  python: {
    pistonLanguage: 'python',
    version: '3.12.0',
    fileName: 'main.py',
  },
  'c++': {
    pistonLanguage: 'c++',
    version: '10.2.0',
    fileName: 'main.cpp',
  },
  'c#': {
    pistonLanguage: 'csharp',
    version: '6.12.0',
    fileName: 'main.cs',
  },
}

type ExecuteCodeInput = {
  code: string
  input?: string
  language: SupportedLanguage
}

type ExecuteCodeResult = {
  stdout: string
  stderr: string
  exitCode: number | null
}

/**
 * Sends a piece of code to the local Piston container for sandboxed execution.
 * This function never runs user code itself — it only brokers the request.
 * The code is sent exactly as written, with no hidden modifications.
 */
export async function executeCode({
  code,
  input,
  language,
}: ExecuteCodeInput): Promise<ExecuteCodeResult> {
  const config = LANGUAGE_CONFIGS[language]

  if (!config) {
    throw new Error(`Unsupported language: ${language}`)
  }

  const response = await axios.post(PISTON_URL, {
    language: config.pistonLanguage,
    version: config.version,
    files: [{ name: config.fileName, content: code }],
    stdin: input ?? '',
  })

  return {
    stdout: response.data.run.stdout,
    stderr: response.data.run.stderr,
    exitCode: response.data.run.code,
  }
}
