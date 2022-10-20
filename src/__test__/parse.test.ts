import { describe, expect, test } from 'vitest'
import { parse } from '..'

describe('testTokenizerFunction', () => {
  test('example', () => {
    const code = 'let a = function() {}'
    expect(parse(code)).toMatchSnapshot()
  })
})
