import BigNumber from 'bignumber.js';
import { DECIMALS } from '../constants/index.js';
import { parseAmount } from './parseAmount.js';

// Plain decimal notation only: no hex, exponents, whitespace or Infinity/NaN.
const PLAIN_DECIMAL = /^-?\d+(\.\d*)?$/;

/**
 * Strict variant of `parseAmount`, meant for user-entered amounts.
 *
 * `parseAmount` accepts anything `bignumber.js` can parse and rounds extra
 * precision, e.g. `"0x10"` -> 16 tokens, `"1e3"` -> 1000 tokens,
 * `"abc"` -> `"NaN"`, `"0.0000000000000000015"` -> `"2"` (18 decimals).
 * This variant throws instead, so the result always equals exactly what was typed.
 *
 * @throws {Error} `Invalid decimals` when numDecimals is not a non-negative integer
 * @throws {Error} `Invalid amount` when amount is not a plain decimal string
 * @throws {Error} `Too many decimals` when amount has more significant decimals than numDecimals
 *
 * @example
 * parseAmountStrict('1.5') // "1500000000000000000"
 * parseAmountStrict('1.50', 1) // "15" (trailing zeros are fine)
 * parseAmountStrict('0x10') // throws "Invalid amount"
 * parseAmountStrict('0.123', 2) // throws "Too many decimals"
 */
export function parseAmountStrict(
  amount: string,
  numDecimals = DECIMALS
): string {
  if (!Number.isInteger(numDecimals) || numDecimals < 0) {
    throw new Error('Invalid decimals');
  }

  if (typeof amount !== 'string' || !PLAIN_DECIMAL.test(amount)) {
    throw new Error('Invalid amount');
  }

  const LocalBigNumber = BigNumber.clone();
  const significantDecimals = new LocalBigNumber(amount).decimalPlaces() ?? 0;

  if (significantDecimals > numDecimals) {
    throw new Error('Too many decimals');
  }

  return parseAmount(amount, numDecimals);
}
