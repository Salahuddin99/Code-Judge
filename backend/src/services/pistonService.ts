import axios from 'axios'
import type { SupportedLanguage } from '../types/Language'

// Local Piston instance (or, once deployed, wherever PISTON_URL points instead)
const PISTON_URL =
  process.env.PISTON_URL || 'http://localhost:2000/api/v2/execute'

interface LanguageConfig {
  pistonLanguage: string // the exact language name Piston's API expects
  version: string // the specific runtime version installed in Pisto
  fileName: string // Piston needs a filename with the right extension
  inputBoilerplate: string // the line(s) prepended so candidates get a ready-to-use input
}

// One config per supported language. Adding a new language later means
// adding one new entry here — nothing else in this file needs to change.
const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  javascript: {
    pistonLanguage: 'javascript',
    version: '20.11.1',
    fileName: 'main.js',
    // Reads stdin and makes it available as `input` — candidates never
    // need to know this line exists.
    inputBoilerplate: `const input = require('fs').readFileSync(0, 'utf-8').trim();\n`,
  },
  python: {
    pistonLanguage: 'python',
    version: '3.12.0',
    fileName: 'main.py',
    // Same idea as JS, but Python's stdin-reading syntax is different.
    // Note the variable is `input_data`, not `input` — `input` is already
    // a reserved built-in function name in Python, so reusing it would
    // silently break candidates' code if they tried to call input().
    inputBoilerplate: `import sys\ninput_data = sys.stdin.read().strip()\n`,
  },
  'c++': {
    pistonLanguage: 'c++',
    version: '10.2.0',
    fileName: 'main.cpp',
    // C++ can't get a fully "magic" input variable the way JS/Python can —
    // candidates still need to read from `cin` themselves. This boilerplate
    // only saves them from writing the common #include lines every time
    inputBoilerplate: `#include <iostream>\n#include <string>\nusing namespace std;\n`,
  },
  'c#': {
    pistonLanguage: 'csharp',
    version: '6.12.0',
    fileName: 'main.cs',
    // Same limitation as C++ — candidates still call Console.ReadLine()
    // themselves; this just saves the one common `using` line.
    inputBoilerplate: `using System;\n`,
  },
}

type ExecuteCodeInput = {
  code: string
  input?: string // the stdin value for THIS specific test case
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
 * Piston handles the actual isolation (no network access, resource limits,
 * automatic cleanup after each run).
 */
export async function executeCode({
  code,
  input,
  language,
}: ExecuteCodeInput): Promise<ExecuteCodeResult> {
  const config = LANGUAGE_CONFIGS[language]

  if (!config) {
    // Defensive check — should never trigger if the frontend only offers
    // the four supported languages, but fails loudly instead of silently
    // sending a bad request to Piston if it somehow does.
    throw new Error(`Unsupported language: ${language}`)
  }

  // Prepend the language-specific boilerplate to whatever the candidate wrote.
  // The candidate and challenge creator never see or write this line themselves.
  const wrappedCode = `${config.inputBoilerplate}${code}`

  const response = await axios.post(PISTON_URL, {
    language: config.pistonLanguage,
    version: config.version,
    files: [{ name: config.fileName, content: wrappedCode }],
    stdin: input ?? '',
  })

  // Piston's raw response has more fields than we need — pull out just
  // the three that matter to the rest of the app.
  return {
    stdout: response.data.run.stdout,
    stderr: response.data.run.stderr,
    exitCode: response.data.run.code,
  }
}
