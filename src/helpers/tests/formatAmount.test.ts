import { formatAmount } from '../formatAmount';

describe('formatAmount – input validation', () => {
  it('throws on non-integer input', () => {
    expect(() => formatAmount({ input: '1.23' })).toThrow('Invalid input');
    expect(() => formatAmount({ input: 'abc' })).toThrow('Invalid input');
  });

  it('returns "0" for zero input', () => {
    expect(formatAmount({ input: '0' })).toBe('0');
    expect(formatAmount({ input: '0', digits: 2 })).toBe('0');
  });
});

describe('formatAmount – integer conversions', () => {
  it('converts big integers to whole numbers', () => {
    expect(formatAmount({ input: '1000000000000000000' })).toBe('1');
    expect(formatAmount({ input: '-2000000000000000000' })).toBe('-2');
  });

  it('respects custom decimals', () => {
    expect(formatAmount({ input: '1000000000000000000', decimals: 8 })).toBe(
      '10000000000'
    );
    expect(formatAmount({ input: '1000000000000000000', decimals: 4 })).toBe(
      '100000000000000'
    );
  });
});

describe('formatAmount – decimal formatting', () => {
  it('pads or trims to `digits` when showLastNonZeroDecimal is true', () => {
    expect(
      formatAmount({
        input: '1100000000000000000',
        digits: 4,
        showLastNonZeroDecimal: true
      })
    ).toBe('1.1000');
    expect(
      formatAmount({
        input: '50500000000000000',
        decimals: 18,
        digits: 4,
        showLastNonZeroDecimal: true
      })
    ).toBe('0.0505');
  });

  it('trims trailing zeros when showLastNonZeroDecimal is false', () => {
    expect(
      formatAmount({
        input: '1100000000000000000',
        digits: 4,
        showLastNonZeroDecimal: false
      })
    ).toBe('1.1');
    expect(
      formatAmount({
        input: '1230000000000000000',
        decimals: 18,
        digits: 4,
        showLastNonZeroDecimal: false
      })
    ).toBe('1.23');
  });

  it('limits decimal length to `digits` when too long', () => {
    expect(
      formatAmount({
        input: '56817349973594872345',
        decimals: 18,
        digits: 4,
        showLastNonZeroDecimal: true
      })
    ).toBe('56.8173');
  });
});

describe('formatAmount – special behaviors', () => {
  it('displays less-than label for tiny amounts', () => {
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

  it('adds commas to large numbers', () => {
    expect(
      formatAmount({
        input: '1000000000000000000000',
        addCommas: true
      })
    ).toBe('1,000');
    expect(
      formatAmount({
        input: '1000000000000000000000',
        addCommas: true,
        digits: 2
      })
    ).toBe('1,000');
  });
});
