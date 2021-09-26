module.exports = {
  env: {
    es6: true,
    browser: true
  },
  extends: 'standard',
  plugins: ['svelte3'],
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3'
    }
  ],
  rules: {
    // https://github.com/sveltejs/eslint-plugin-svelte3/issues/41#issuecomment-572503966
    'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 2, maxEOF: 0 }]
  },
  globals: {
    GM_getValue: true,
    GM_setValue: true,
    unsafeWindow: true
  }
}
