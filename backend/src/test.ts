import { runVisibleTests } from './services/testRunnerService'

async function run() {
  const code = `
    console.log(2 + 2);
  `

  const testCases = [
    { input: '', expectedOutput: '4', hidden: false },
    { input: '', expectedOutput: '5', hidden: false }, // deliberately wrong, to confirm fail detection works
  ]

  const results = await runVisibleTests(code, testCases)
  console.log(results)
}

run()
