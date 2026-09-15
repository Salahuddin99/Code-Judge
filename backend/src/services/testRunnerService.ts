import { executeCode } from './pistonService'

// The languages this judge currently supports.
// Kept here too (not just in pistonService) so TypeScript can catch
// a typo'd language anywhere it's used, not just at execution time.
import type { SupportedLanguage } from '../types/Language'

// One test case: an input to run, and what output we expect back
interface TestCase {
  input: string
  expectedOutput: string
  hidden: boolean
}

// The result of running one test case
interface TestResult {
  input: string
  passed: boolean
  actualOutput: string
  error: string | null
}

/**
 * Runs a piece of code against a list of test cases and reports pass/fail for each.
 * This function knows nothing about HTTP — it can be called from a route,
 * a CLI script, or a future test suite without any changes.
 *
 * `language` is passed straight through to pistonService, which uses it to
 * decide which Piston runtime to use and which stdin boilerplate to inject.
 */

export async function runTests(
  code: string,
  testCases: TestCase[],
  language: SupportedLanguage,
): Promise<TestResult[]> {
  const results: TestResult[] = []

  // We run the SAME code once per test case, because each test case
  // has different input — the code itself never changes between runs,
  // only what gets fed into it via stdin.
  for (const testCase of testCases) {
    const result = await executeCode({ code, input: testCase.input, language })

    // If the code crashed (non-empty stderr or non-zero exit), it's an automatic fail —
    // a crash is never a "correct answer", regardless of what stdout happened to contain.
    const crashed = result.stderr.trim() !== '' || result.exitCode !== 0

    // .trim() removes stray leading/trailing whitespace or newlines so a technically-correct
    // answer (e.g. "6\n" vs "6") doesn't get marked wrong just because of invisible characters.
    const actualOutput = result.stdout.trim()
    const expected = testCase.expectedOutput.trim()

    results.push({
      input: testCase.input,
      passed: !crashed && actualOutput === expected,
      actualOutput,
      // Only include the error message if it actually crashed — keeps successful
      // results clean instead of always having an empty error field.
      error: crashed ? result.stderr.trim() : null,
    })
  }

  return results
}

/**
 * Convenience helper: runs only the VISIBLE test cases.
 * Used by the /api/run endpoint — the candidate is still working on the
 * problem, so hidden test cases (and their expected answers) must never
 * be sent to or run for the client to inspect at this stage.
 */

export async function runVisibleTests(
  code: string,
  allTestCases: TestCase[],
  language: SupportedLanguage,
): Promise<TestResult[]> {
  const visible = allTestCases.filter((tc) => !tc.hidden)
  return runTests(code, visible, language)
}

/**
 * Convenience helper: runs ALL test cases — visible AND hidden.
 * Used by the /api/submit endpoint, since a final verdict needs to check
 * against every test case, including the ones the candidate never saw.
 */

export async function runAllTests(
  code: string,
  allTestCases: TestCase[],
  language: SupportedLanguage,
): Promise<TestResult[]> {
  return runTests(code, allTestCases, language)
}
