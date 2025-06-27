import { formatAmount } from '../formatAmount';

describe('formatAmount', () => {
  test('throws error for invalid input', () => {
    expect(() => formatAmount({ input: 'abc' })).toThrow('Invalid input');
    expect(() => formatAmount({ input: '1.23' })).toThrow('Invalid input');
    expect(() => formatAmount({ input: '-1.23' })).toThrow('Invalid input');
  });

  test('handles zero values', () => {
    expect(formatAmount({ input: '0' })).toBe('0');
    expect(formatAmount({ input: '0', digits: 2 })).toBe('0');
  });

  test('formats positive integers', () => {
    expect(formatAmount({ input: '1000000000000000000' })).toBe('1');
    expect(formatAmount({ input: '2000000000000000000' })).toBe('2');
  });

  test('formats negative integers', () => {
    expect(formatAmount({ input: '-1000000000000000000' })).toBe('-1');
    expect(formatAmount({ input: '-2000000000000000000' })).toBe('-2');
  });

  test('handles custom decimals', () => {
    expect(formatAmount({ input: '1000000000000000000', decimals: 8 })).toBe(
      '10000000000'
    );

    expect(formatAmount({ input: '1000000000000000000', decimals: 4 })).toBe(
      '100000000000000'
    );

    expect(
      formatAmount({ input: '56817349973594872345', decimals: 18, digits: 4 })
    ).toBe('56.817349973594872345');
  });

  test('handles custom digits', () => {
    expect(formatAmount({ input: '1000000000000000000', digits: 2 })).toBe('1');
    expect(formatAmount({ input: '1000000000000000000', digits: 4 })).toBe('1');
  });

  test('adds commas when specified', () => {
    expect(
      formatAmount({ input: '1000000000000000000000', addCommas: true })
    ).toBe('1,000');

    expect(
      formatAmount({
        input: '1000000000000000000000',
        addCommas: true,
        digits: 2
      })
    ).toBe('1,000');
  });

  test('handles showIsLessThanDecimalsLabel', () => {
    const input = '1000000000000000';
    expect(
      formatAmount({
        input,
        showIsLessThanDecimalsLabel: true,
        digits: 2,
        showLastNonZeroDecimal: false
      })
    ).toBe('<0.01');
  });

  test('handles showLastNonZeroDecimal', () => {
    expect(
      formatAmount({
        input: '1100000000000000000',
        showLastNonZeroDecimal: true,
        digits: 4
      })
    ).toBe('1.1000');

    expect(
      formatAmount({
        input: '1100000000000000000',
        showLastNonZeroDecimal: false,
        digits: 4
      })
    ).toBe('1.1000');
  });

  test('showLastNonZeroDecimal: true shows max(decimals, digits)', () => {
    expect(
      formatAmount({
        input: '1123456789000000000',
        showLastNonZeroDecimal: true,
        digits: 4
      })
    ).toBe('1.123456789');

    expect(
      formatAmount({
        input: '1100000000000000000',
        showLastNonZeroDecimal: true,
        digits: 4
      })
    ).toBe('1.1000');

    expect(
      formatAmount({
        input: '1000000000000000000',
        showLastNonZeroDecimal: true,
        digits: 4
      })
    ).toBe('1');

    expect(
      formatAmount({
        input: '50500000000000000',
        showLastNonZeroDecimal: true,
        digits: 4
      })
    ).toBe('0.0505');
  });

  test('showLastNonZeroDecimal: false shows exactly digits', () => {
    expect(
      formatAmount({
        input: '1123456789000000000',
        showLastNonZeroDecimal: false,
        digits: 4
      })
    ).toBe('1.1234');

    expect(
      formatAmount({
        input: '1230000000000000000',
        showLastNonZeroDecimal: false,
        digits: 4
      })
    ).toBe('1.2300');

    expect(
      formatAmount({
        input: '1000000000000000000',
        showLastNonZeroDecimal: false,
        digits: 4
      })
    ).toBe('1');
  });

  test('handles very small amounts with less-than label', () => {
    expect(
      formatAmount({
        input: '1',
        decimals: 18,
        digits: 4,
        showIsLessThanDecimalsLabel: true,
        showLastNonZeroDecimal: false
      })
    ).toBe('<0.0001');
  });

  test('handles large numbers with commas', () => {
    expect(
      formatAmount({
        input: '1000000000000000000000',
        addCommas: true,
        digits: 2
      })
    ).toBe('1,000');

    expect(
      formatAmount({
        input: '123456789000000000000000',
        addCommas: true,
        showLastNonZeroDecimal: false,
        digits: 2
      })
    ).toBe('123,456.78');
  });

  test('handles negative amounts', () => {
    expect(
      formatAmount({
        input: '-1100000000000000000',
        showLastNonZeroDecimal: true,
        digits: 4
      })
    ).toBe('-1.1000');

    expect(
      formatAmount({
        input: '-1123456789000000000',
        showLastNonZeroDecimal: false,
        digits: 4
      })
    ).toBe('-1.1234');
  });

  test('handles different token decimals', () => {
    expect(
      formatAmount({
        input: '1500000',
        decimals: 6,
        showLastNonZeroDecimal: true,
        digits: 4
      })
    ).toBe('1.5000');

    expect(
      formatAmount({
        input: '150000000',
        decimals: 8,
        showLastNonZeroDecimal: false,
        digits: 6
      })
    ).toBe('1.500000');
  });
});
