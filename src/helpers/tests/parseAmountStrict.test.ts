import { parseAmount } from '../parseAmount';
import { parseAmountStrict } from '../parseAmountStrict';

describe('parseAmountStrict', () => {
  it('matches parseAmount for valid plain decimals', () => {
    const cases: [string, number?][] = [
      ['10'],
      ['10', 6],
      ['0.1'],
      ['1.5'],
      ['0.000000000000000001'],
      ['-1'],
      ['1.'],
      ['007'],
      ['1.50', 1],
      ['5', 0]
    ];

    cases.forEach(([amount, decimals]) => {
      expect(parseAmountStrict(amount, decimals)).toBe(
        parseAmount(amount, decimals)
      );
    });
  });

  it('throws for amounts that are not plain decimals', () => {
    [
      '0x10',
      '1e3',
      'abc',
      'NaN',
      'Infinity',
      '',
      ' 1',
      '1 ',
      '.5',
      '1,000',
      '+1',
      '--1'
    ].forEach((amount) => {
      expect(() => parseAmountStrict(amount)).toThrow('Invalid amount');
    });
  });

  it('throws instead of rounding extra decimals', () => {
    expect(() => parseAmountStrict('0.0000000000000000015')).toThrow(
      'Too many decimals'
    );
    expect(() => parseAmountStrict('0.123', 2)).toThrow('Too many decimals');
    expect(() => parseAmountStrict('1.5', 0)).toThrow('Too many decimals');
  });

  it('throws for invalid decimals', () => {
    expect(() => parseAmountStrict('1', -1)).toThrow('Invalid decimals');
    expect(() => parseAmountStrict('1', 1.5)).toThrow('Invalid decimals');
    expect(() => parseAmountStrict('1', NaN)).toThrow('Invalid decimals');
  });
});
