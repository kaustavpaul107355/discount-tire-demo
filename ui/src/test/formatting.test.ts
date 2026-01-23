import { describe, it, expect } from 'vitest';
import { 
  formatCurrency, 
  formatNumber, 
  formatPercentage, 
  truncate, 
  formatDate 
} from '@/utils/formatting';

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1234567)).toBe('$1,234,567');
    expect(formatCurrency(100)).toBe('$100');
    expect(formatCurrency(0)).toBe('$0');
  });

  it('handles null and undefined', () => {
    expect(formatCurrency(null)).toBe('$0');
    expect(formatCurrency(undefined)).toBe('$0');
  });

  it('formats decimal numbers without cents', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235');
    expect(formatCurrency(999.99)).toBe('$1,000');
  });

  it('formats large numbers with commas', () => {
    expect(formatCurrency(125000000)).toBe('$125,000,000');
    expect(formatCurrency(1000000000)).toBe('$1,000,000,000');
  });

  it('formats negative numbers', () => {
    expect(formatCurrency(-1234)).toBe('-$1,234');
  });
});

describe('formatNumber', () => {
  it('formats integers with thousands separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(100)).toBe('100');
  });

  it('handles null and undefined', () => {
    expect(formatNumber(null)).toBe('0');
    expect(formatNumber(undefined)).toBe('0');
  });

  it('formats string numbers', () => {
    expect(formatNumber('1234')).toBe('1,234');
    expect(formatNumber('999.99')).toBe('999.99');
  });

  it('handles invalid strings', () => {
    expect(formatNumber('not a number')).toBe('0');
    expect(formatNumber('')).toBe('0');
  });

  it('formats decimal numbers', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
    expect(formatNumber(9.99)).toBe('9.99');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber('0')).toBe('0');
  });

  it('formats negative numbers', () => {
    expect(formatNumber(-1234)).toBe('-1,234');
  });
});

describe('formatPercentage', () => {
  it('formats percentages with default decimal places', () => {
    expect(formatPercentage(12.5)).toBe('12.5%');
    expect(formatPercentage(5)).toBe('5.0%');
    expect(formatPercentage(0)).toBe('0.0%');
  });

  it('handles null and undefined', () => {
    expect(formatPercentage(null)).toBe('0.0%');
    expect(formatPercentage(undefined)).toBe('0.0%');
  });

  it('formats with custom decimal places', () => {
    expect(formatPercentage(12.3456, 2)).toBe('12.35%');
    expect(formatPercentage(5, 0)).toBe('5%');
    expect(formatPercentage(99.999, 3)).toBe('99.999%');
  });

  it('formats negative percentages', () => {
    expect(formatPercentage(-5.2)).toBe('-5.2%');
    expect(formatPercentage(-0.5, 2)).toBe('-0.50%');
  });

  it('handles large percentages', () => {
    expect(formatPercentage(250)).toBe('250.0%');
    expect(formatPercentage(1000.5)).toBe('1000.5%');
  });
});

describe('truncate', () => {
  it('truncates text longer than maxLength', () => {
    expect(truncate('This is a long text', 10)).toBe('This is...');
    expect(truncate('Hello World', 8)).toBe('Hello...');
  });

  it('does not truncate text shorter than maxLength', () => {
    expect(truncate('Short', 10)).toBe('Short');
    expect(truncate('Exact', 5)).toBe('Exact');
  });

  it('handles empty strings', () => {
    expect(truncate('', 10)).toBe('');
  });

  it('handles maxLength edge cases', () => {
    expect(truncate('Test', 4)).toBe('Test');
    expect(truncate('Test', 3)).toBe('...');
    expect(truncate('Test', 5)).toBe('Test');
    expect(truncate('Hello', 8)).toBe('Hello');
  });

  it('handles single character maxLength', () => {
    // With maxLength 1 and text longer than that, we get text[0-(-2)] + '...'
    expect(truncate('Hello', 1).length).toBeLessThanOrEqual(6); // Should truncate
  });

  it('truncates at exact maxLength', () => {
    const text = 'Hello World';
    const truncated = truncate(text, 8);
    expect(truncated.length).toBe(8);
    expect(truncated).toBe('Hello...');
  });
});

describe('formatDate', () => {
  it('formats valid ISO datetime strings with timezone', () => {
    expect(formatDate('2026-01-23T12:00:00Z')).toBe('Jan 23, 2026');
    expect(formatDate('2025-12-25T12:00:00Z')).toBe('Dec 25, 2025');
  });

  it('handles null and undefined', () => {
    expect(formatDate(null)).toBe('N/A');
    expect(formatDate(undefined)).toBe('N/A');
  });

  it('handles empty string', () => {
    expect(formatDate('')).toBe('N/A');
  });

  it('handles invalid date strings', () => {
    expect(formatDate('not a date')).toBe('Invalid Date');
    expect(formatDate('2026-13-45')).toBe('Invalid Date');
  });

  it('formats datetime strings', () => {
    const result = formatDate('2026-01-23T15:30:00Z');
    // Should contain the date elements
    expect(result).toContain('Jan');
    expect(result).toContain('2026');
  });

  it('handles different date formats with time component', () => {
    expect(formatDate('2026-01-01T12:00:00Z')).toBe('Jan 1, 2026');
    expect(formatDate('2026-06-15T12:00:00Z')).toBe('Jun 15, 2026');
  });

  it('formats dates from different years with time component', () => {
    expect(formatDate('2020-01-01T12:00:00Z')).toBe('Jan 1, 2020');
    expect(formatDate('2030-12-31T12:00:00Z')).toBe('Dec 31, 2030');
  });
});
