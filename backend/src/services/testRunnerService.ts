import { executeCode } from './pistonService'

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
 */

export async function runTests(
  code: string,
  testCases: TestCase[],
): Promise<TestResult[]> {
  const results: TestResult[] = []

  for (const testCase of testCases) {
    const result = await executeCode({ code, input: testCase.input })

    // If the code crashed (non-empty stderr or non-zero exit), it's an automatic fail
    const crashed = result.stderr.trim() !== '' || result.exitCode !== 0
    const actualOutput = result.stdout.trim()
    const expected = testCase.expectedOutput.trim()

    results.push({
      input: testCase.input,
      passed: !crashed && actualOutput === expected,
      actualOutput,
      error: crashed ? result.stderr.trim() : null,
    })
  }

  return results
}

/**
 * Convenience helper: runs only the visible test cases.
 * Used by the /api/run endpoint (candidate is still working on the problem).
 */

export async function runVisibleTests(
  code: string,
  allTestCases: TestCase[],
): Promise<TestResult[]> {
  const visible = allTestCases.filter((tc) => !tc.hidden)
  return runTests(code, visible)
}

/**
 * Convenience helper: runs ALL test cases, visible and hidden.
 * Used by the /api/submit endpoint (final verdict).
 */

export async function runAllTests(
  code: string,
  allTestCases: TestCase[],
): Promise<TestResult[]> {
  return runTests(code, allTestCases)
}
