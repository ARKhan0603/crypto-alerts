import { describe, expect, it } from 'vitest'
import { getErrorMessage, getFieldErrors } from './errors'

describe('getFieldErrors', () => {
  it('flattens DRF field errors', () => {
    expect(getFieldErrors({ data: { username: ['Taken.'], detail: 'x' } })).toEqual({
      username: 'Taken.',
    })
  })
  it('ignores non-object payloads', () => {
    expect(getFieldErrors({ data: 'boom' })).toEqual({})
    expect(getFieldErrors(undefined)).toEqual({})
  })
})

describe('getErrorMessage', () => {
  it('maps network failures', () => {
    expect(getErrorMessage({ status: 'FETCH_ERROR' })).toMatch(/cannot reach/i)
  })
  it('prefers detail, then non_field_errors, then the first field error', () => {
    expect(getErrorMessage({ status: 401, data: { detail: 'Nope' } })).toBe('Nope')
    expect(
      getErrorMessage({ status: 400, data: { non_field_errors: ['Bad creds'] } }),
    ).toBe('Bad creds')
    expect(getErrorMessage({ status: 400, data: { symbol: ['Unknown'] } })).toBe(
      'Unknown',
    )
  })
  it('never leaks HTML error pages', () => {
    expect(getErrorMessage({ status: 500, data: '<html>..</html>' }, 'fallback')).toBe(
      'fallback',
    )
  })
})
