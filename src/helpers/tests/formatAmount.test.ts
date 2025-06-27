import { formatAmount } from '../formatAmount';

describe('formatAmount', () => {
  test('throws error for invalid input that is not an integer string', () => {
    expect(() => formatAmount({ input: 'abc' })).toThrow('Invalid input');
    expect(() => formatAmount({ input: '1.23' })).toThrow('Invalid input');
    expect(() => formatAmount({ input: '-1.23' })).toThrow('Invalid input');
  });

  test('handles zero values correctly', () => {
    expect(formatAmount({ input: '0' })).toBe('0'); // 0 EGLD
    expect(formatAmount({ input: '0', digits: 2 })).toBe('0'); // 0 EGLD
  });

  test('formats positive integer amounts without decimal places', () => {
    expect(formatAmount({ input: '1000000000000000000' })).toBe('1'); // 1 EGLD
    expect(formatAmount({ input: '2000000000000000000' })).toBe('2'); // 2 EGLD
  });

  test('formats negative integer amounts without decimal places', () => {
    expect(formatAmount({ input: '-1000000000000000000' })).toBe('-1'); // -1 EGLD
    expect(formatAmount({ input: '-2000000000000000000' })).toBe('-2'); // -2 EGLD
  });

  test('handles custom decimals for different token types', () => {
    expect(formatAmount({ input: '1000000000000000000', decimals: 8 })).toBe(
      '10000000000'
    ); // 10000000000 tokens (8 decimals)

    expect(formatAmount({ input: '1000000000000000000', decimals: 4 })).toBe(
      '100000000000000'
    ); // 100000000000000 tokens (4 decimals)

    expect(
      formatAmount({ input: '56817349973594872345', decimals: 18, digits: 4 }) // 56.817349973594872345 EGLD
    ).toBe('56.817349973594872345');
  });

  test('handles custom digits parameter', () => {
    expect(formatAmount({ input: '1000000000000000000', digits: 2 })).toBe('1'); // 1 EGLD
    expect(formatAmount({ input: '1000000000000000000', digits: 4 })).toBe('1'); // 1 EGLD
  });

  test('adds thousands separators (commas) when specified', () => {
    expect(
      formatAmount({ input: '1000000000000000000000', addCommas: true }) // 1000 EGLD
    ).toBe('1,000');

    expect(
      formatAmount({
        input: '1000000000000000000000', // 1000 EGLD
        addCommas: true,
        digits: 2
      })
    ).toBe('1,000');
  });

  test('handles showIsLessThanDecimalsLabel for very small amounts', () => {
    const input = '1000000000000000'; // 0.001 EGLD
    expect(
      formatAmount({
        input,
        showIsLessThanDecimalsLabel: true,
        digits: 2
      })
    ).toBe('<0.01');
  });

  test('showLastNonZeroDecimal controls decimal place formatting behavior', () => {
    expect(
      formatAmount({
        input: '1100000000000000000', // 1.1 EGLD
        digits: 4
      })
    ).toBe('1.1');

    expect(
      formatAmount({
        input: '1100000000000000000', // 1.1 EGLD
        showLastNonZeroDecimal: false,
        digits: 4
      })
    ).toBe('1.1000');
  });

  test('showLastNonZeroDecimal=true shows all significant decimals regardless of digits parameter', () => {
    expect(
      formatAmount({
        input: '1123456789000000000', // 1.123456789 EGLD
        digits: 4
      })
    ).toBe('1.123456789');

    expect(
      formatAmount({
        input: '1100000000000000000', // 1.1 EGLD
        digits: 4
      })
    ).toBe('1.1');

    expect(
      formatAmount({
        input: '1000000000000000000', // 1 EGLD
        digits: 4
      })
    ).toBe('1');

    expect(
      formatAmount({
        input: '50500000000000000', // 0.0505 EGLD
        digits: 4
      })
    ).toBe('0.0505');
  });

  test('showLastNonZeroDecimal=false shows exactly digits decimal places', () => {
    expect(
      formatAmount({
        input: '1123456789000000000', // 1.123456789 EGLD
        showLastNonZeroDecimal: false,
        digits: 4
      })
    ).toBe('1.1234');

    expect(
      formatAmount({
        input: '1230000000000000000', // 1.23 EGLD
        showLastNonZeroDecimal: false,
        digits: 4
      })
    ).toBe('1.2300');

    expect(
      formatAmount({
        input: '1000000000000000000', // 1 EGLD
        showLastNonZeroDecimal: false,
        digits: 4
      })
    ).toBe('1');
  });

  test('decimal formatting follows showLastNonZeroDecimal parameter rules', () => {
    expect(
      formatAmount({
        input: '1100000000000000000', // 1.1 EGLD
        digits: 4
      })
    ).toBe('1.1');

    expect(
      formatAmount({
        input: '1200000000000000000', // 1.2 EGLD
        digits: 6
      })
    ).toBe('1.2');

    expect(
      formatAmount({
        input: '1100000000000000000', // 1.1 EGLD
        showLastNonZeroDecimal: false,
        digits: 4
      })
    ).toBe('1.1000');

    expect(
      formatAmount({
        input: '1200000000000000000', // 1.2 EGLD
        showLastNonZeroDecimal: false,
        digits: 6
      })
    ).toBe('1.200000');
  });

  test('showLastNonZeroDecimal=true displays all significant decimals when they exceed digits parameter', () => {
    expect(
      formatAmount({
        input: '1123456789000000000', // 1.123456789 EGLD
        digits: 4
      })
    ).toBe('1.123456789');

    expect(
      formatAmount({
        input: '1123456789000000000', // 1.123456789 EGLD
        digits: 2
      })
    ).toBe('1.123456789');
  });

  test('handles very small amounts with less-than label correctly', () => {
    expect(
      formatAmount({
        input: '1', // 0.000000000000000001 EGLD
        decimals: 18,
        digits: 4,
        showIsLessThanDecimalsLabel: true,
        showLastNonZeroDecimal: false
      })
    ).toBe('<0.0001');
  });

  test('formats large numbers with thousands separators (commas)', () => {
    expect(
      formatAmount({
        input: '1000000000000000000000', // 1000 EGLD
        addCommas: true,
        digits: 2
      })
    ).toBe('1,000');

    expect(
      formatAmount({
        input: '123456789000000000000000', // 123456.789 EGLD
        addCommas: true,
        showLastNonZeroDecimal: false,
        digits: 2
      })
    ).toBe('123,456.78');
  });

  test('handles negative amounts with proper decimal formatting', () => {
    expect(
      formatAmount({
        input: '-1100000000000000000', // -1.1 EGLD
        digits: 4
      })
    ).toBe('-1.1');

    expect(
      formatAmount({
        input: '-1123456789000000000', // -1.123456789 EGLD
        showLastNonZeroDecimal: false,
        digits: 4
      })
    ).toBe('-1.1234');
  });

  test('handles different token decimals correctly (USDC example)', () => {
    expect(
      formatAmount({
        input: '1500000', // 1.5 USDC (6 decimals)
        decimals: 6,
        digits: 4
      })
    ).toBe('1.5');

    expect(
      formatAmount({
        input: '150000000', // 1.5 tokens (8 decimals)
        decimals: 8,
        showLastNonZeroDecimal: false,
        digits: 6
      })
    ).toBe('1.500000');
  });

  test('showLastNonZeroDecimal=false pads with trailing zeros to match digits parameter', () => {
    expect(
      formatAmount({
        input: '1100000000000000000', // 1.1 EGLD
        showLastNonZeroDecimal: false,
        digits: 4
      })
    ).toBe('1.1000');

    expect(
      formatAmount({
        input: '1230000000000000000', // 1.23 EGLD
        showLastNonZeroDecimal: false,
        digits: 6
      })
    ).toBe('1.230000');
  });
});
