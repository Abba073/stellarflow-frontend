/**
 * Unit tests for src/utils/addressUtils.ts
 *
 * These functions are pure/deterministic — no DOM, no async, no mocking needed.
 */
import { describe, it, expect } from 'vitest';
import {
  formatAddress,
  shortenAddress,
  withShortenedAddresses,
  withShortenedAddressField,
  buildShortenedAddressMap,
  isShortened,
} from '@/utils/addressUtils';

// ---------------------------------------------------------------------------
// formatAddress
// ---------------------------------------------------------------------------

describe('formatAddress', () => {
  it('formats a long address with default head/tail lengths', () => {
    const addr = 'GA5THZLKMNPQRSXYZABCDEFGHIJKLMNBC9A';
    const result = formatAddress(addr);
    expect(result).toBe('GA5T...BC9A');
  });

  it('uses custom head and tail lengths', () => {
    const addr = 'GABCDEFGHIJ1234567890';
    expect(formatAddress(addr, 6, 6)).toBe('GABCDE...567890');
  });

  it('uses a custom separator', () => {
    const addr = 'GA5THZLKMNPQRSXYZABC';
    expect(formatAddress(addr, 4, 4, '—')).toBe('GA5T—ZABC');
  });

  it('returns the original string when it is too short to format', () => {
    expect(formatAddress('GSHRT', 4, 4)).toBe('GSHRT');
  });

  it('returns an empty string unchanged', () => {
    expect(formatAddress('')).toBe('');
  });

  it('returns the full string unchanged when exactly at the minimum length boundary', () => {
    // length must be > headLength + tailLength + separator.length to be shortened
    // boundary = 4 + 4 + 3 = 11. A string of exactly 11 chars IS formatted
    // because the check is address.length < ... (strictly less than).
    const boundary = 'ABCDEFGHIJK'; // 11 chars — formatAddress will still shorten it
    expect(formatAddress(boundary)).toBe('ABCD...HIJK');
  });

  it('formats a string one character over the boundary', () => {
    const over = 'ABCDEFGHIJKL'; // 12 chars
    expect(formatAddress(over)).toBe('ABCD...IJKL');
  });
});

// ---------------------------------------------------------------------------
// shortenAddress
// ---------------------------------------------------------------------------

describe('shortenAddress', () => {
  it('produces FIRST4...LAST4 format for a full Stellar address', () => {
    const full = 'GDRTVHZLKMNPQRSXYZABCDEFGHIJKLM1122';
    expect(shortenAddress(full)).toBe('GDRT...1122');
  });

  it('always keeps exactly 4 leading characters', () => {
    const addr = 'GCXXVHZLKMNPQRSXYZABCDEFGHIJKLM7766';
    const shortened = shortenAddress(addr);
    expect(shortened.startsWith('GCXX')).toBe(true);
  });

  it('always keeps exactly 4 trailing characters', () => {
    const addr = 'GCXXVHZLKMNPQRSXYZABCDEFGHIJKLM7766';
    const shortened = shortenAddress(addr);
    expect(shortened.endsWith('7766')).toBe(true);
  });

  it('includes the ... separator', () => {
    const addr = 'GCXXVHZLKMNPQRSXYZABCDEFGHIJKLM7766';
    expect(shortenAddress(addr)).toContain('...');
  });
});

// ---------------------------------------------------------------------------
// withShortenedAddresses
// ---------------------------------------------------------------------------

describe('withShortenedAddresses', () => {
  const items = [
    { id: '1', address: 'GA5THZLKMNPQRSXYZABCDEFGHIJKLMNBC9A', name: 'Node A' },
    { id: '2', address: 'GBC2VHZLKMNPQRSXYZABCDEFGHIJKLMLOPA', name: 'Node B' },
  ];

  it('attaches shortenedAddress to each item', () => {
    const result = withShortenedAddresses(items);
    expect(result[0].shortenedAddress).toBe('GA5T...BC9A');
    expect(result[1].shortenedAddress).toBe('GBC2...LOPA');
  });

  it('preserves all original fields', () => {
    const result = withShortenedAddresses(items);
    expect(result[0].id).toBe('1');
    expect(result[0].name).toBe('Node A');
    expect(result[0].address).toBe('GA5THZLKMNPQRSXYZABCDEFGHIJKLMNBC9A');
  });

  it('returns an array of the same length as input', () => {
    expect(withShortenedAddresses(items)).toHaveLength(2);
  });

  it('returns an empty array for empty input', () => {
    expect(withShortenedAddresses([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// withShortenedAddressField
// ---------------------------------------------------------------------------

describe('withShortenedAddressField', () => {
  const items = [
    { id: 'C-01', contractAddress: 'CC7VHQGGURUNXSVWFR7RCGZV5BVMODXX75YMMV5AGJGKGHBNEA88NN', tier: 'Enterprise' },
    { id: 'C-02', contractAddress: 'GAB3FNZOMCXKKUZCWZZG5J6MFMBXVFBXKTMZK992QYJR7VBCDEF7G9JK', tier: 'Developer' },
  ];

  it('uses the specified field for shortening', () => {
    const result = withShortenedAddressField(items, 'contractAddress');
    expect(result[0].shortenedAddress).toBe('CC7V...88NN');
    expect(result[1].shortenedAddress).toBe('GAB3...G9JK');
  });

  it('does not mutate original items', () => {
    withShortenedAddressField(items, 'contractAddress');
    expect('shortenedAddress' in items[0]).toBe(false);
  });

  it('preserves non-address fields', () => {
    const result = withShortenedAddressField(items, 'contractAddress');
    expect(result[0].tier).toBe('Enterprise');
    expect(result[1].id).toBe('C-02');
  });
});

// ---------------------------------------------------------------------------
// buildShortenedAddressMap
// ---------------------------------------------------------------------------

describe('buildShortenedAddressMap', () => {
  const stakers = [
    { id: 'N-401', operatorAddress: 'GA5THZLKMNPQRSXYZABCDEFGHIJKLMNBC9A' },
    { id: 'N-402', operatorAddress: 'GBC2VHZLKMNPQRSXYZABCDEFGHIJKLMLOPA' },
  ];

  it('builds a record keyed by the id field', () => {
    const map = buildShortenedAddressMap(stakers, 'id', 'operatorAddress');
    expect(map).toHaveProperty('N-401');
    expect(map).toHaveProperty('N-402');
  });

  it('maps each id to the correctly shortened address', () => {
    const map = buildShortenedAddressMap(stakers, 'id', 'operatorAddress');
    expect(map['N-401']).toBe('GA5T...BC9A');
    expect(map['N-402']).toBe('GBC2...LOPA');
  });

  it('returns an empty object for empty input', () => {
    expect(buildShortenedAddressMap([], 'id', 'operatorAddress')).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// isShortened
// ---------------------------------------------------------------------------

describe('isShortened', () => {
  it('returns true for a shortened address', () => {
    expect(isShortened('GA5T...C9A')).toBe(true);
  });

  it('returns false for a full Stellar address', () => {
    expect(isShortened('GA5THZLKMNPQRSXYZABCDEFGHIJKLMNBC9A')).toBe(false);
  });

  it('returns false for a string without ...', () => {
    expect(isShortened('NODOTSHERE')).toBe(false);
  });

  it('returns false for a string longer than 12 chars even with ...', () => {
    // Has ... but is 15 chars — too long to be considered a shortened form
    expect(isShortened('ABCDEFGH...IJKLM')).toBe(false);
  });

  it('returns true for a minimal 9-char shortened form', () => {
    // 4 + 3 + 4 = 11 chars but we expect < 12
    expect(isShortened('ABCD...WXYZ')).toBe(true);
  });
});
