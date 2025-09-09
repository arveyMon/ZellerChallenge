// __tests__/sqlite.utils.test.ts
import { normType } from '../src/db/sqlite'

describe('normType', () => {
  it('normalizes admin/manager/other', () => {
    expect(normType('Admin')).toBe('Admin')
    expect(normType(' admin ')).toBe('Admin')
    expect(normType('MANAGER')).toBe('Manager')
    expect(normType('foo')).toBe('Other')
    expect(normType(undefined)).toBe('Other')
  })
})