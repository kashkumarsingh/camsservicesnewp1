/**
 * Unit tests for extractList and isPaginated.
 * Run: npm run test (or npx vitest run src/infrastructure/http/responseHelpers.test.ts)
 */

import { describe, it, expect } from 'vitest';
import { extractList, isPaginated } from './responseHelpers';

type Item = { id: string; name: string };

describe('isPaginated', () => {
  it('returns true for object with data array', () => {
    expect(isPaginated<Item>({ data: [] })).toBe(true);
    expect(isPaginated<Item>({ data: [{ id: '1', name: 'a' }] })).toBe(true);
    expect(isPaginated<Item>({ data: [], meta: { total: 10 } })).toBe(true);
  });

  it('returns false for non-array data', () => {
    expect(isPaginated({ data: 'oops' })).toBe(false);
    expect(isPaginated({ data: 123 })).toBe(false);
    expect(isPaginated({ data: null })).toBe(false);
  });

  it('returns false for non-object or missing data', () => {
    expect(isPaginated(null)).toBe(false);
    expect(isPaginated(undefined)).toBe(false);
    expect(isPaginated([])).toBe(false);
    expect(isPaginated({})).toBe(false);
    expect(isPaginated({ meta: {} })).toBe(false);
  });
});

describe('extractList', () => {
  it('returns direct array when response.data is an array', () => {
    const list: Item[] = [{ id: '1', name: 'a' }];
    expect(extractList({ data: list })).toBe(list);
    expect(extractList({ data: list })).toEqual([{ id: '1', name: 'a' }]);
  });

  it('returns inner array when response.data is paginated shape', () => {
    const list: Item[] = [{ id: '1', name: 'a' }];
    const response = { data: { data: list, meta: { total: 1 } } };
    expect(extractList(response)).toEqual(list);
    expect(extractList(response)).toBe(list);
  });

  it('returns empty array for empty direct array', () => {
    expect(extractList({ data: [] })).toEqual([]);
  });

  it('returns empty array for empty paginated shape', () => {
    expect(extractList({ data: { data: [] } })).toEqual([]);
    expect(extractList({ data: { data: [], meta: {} } })).toEqual([]);
  });

  it('returns empty array for null/undefined response or data', () => {
    expect(extractList(null)).toEqual([]);
    expect(extractList(undefined)).toEqual([]);
    expect(extractList({ data: null as unknown as Item[] })).toEqual([]);
    expect(extractList({ data: undefined as unknown as Item[] })).toEqual([]);
  });

  it('throws when data looks paginated but data.data is not an array', () => {
    expect(() => extractList({ data: { data: 'oops' as unknown as Item[] } })).toThrow(
      /\[extractList\].*data\.data is not an array/
    );
    expect(() => extractList({ data: { data: 123 as unknown as Item[] } })).toThrow(
      /\[extractList\].*data\.data is not an array/
    );
  });

  it('returns empty array for other unexpected shapes (no data key or non-array)', () => {
    expect(extractList({ data: {} as unknown as Item[] })).toEqual([]);
    expect(extractList({ data: { meta: {} } as unknown as Item[] })).toEqual([]);
  });
});
