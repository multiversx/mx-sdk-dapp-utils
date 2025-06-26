import { TokenTransfer } from '@multiversx/sdk-core';
import BigNumber from 'bignumber.js';
import { pipe } from './pipe';
import { DECIMALS, DIGITS, ZERO } from '../constants';
import { stringIsInteger } from './stringIsInteger';

export interface FormatAmountProps {
  /**
   * The raw integer amount (string) in the smallest token unit.
   * Must be a valid integer string (no decimals, may include leading "-").
   */
  input: string;
  /**
   * Number of decimals defined by the token (e.g. 18 for ERC-20 ETH).
   * Default: DECIMALS (typically 18).
   */
  decimals?: number;
  /**
   * Maximum number of decimal digits to display.
   * Combined with `showLastNonZeroDecimal` to decide padding or trimming.
   * Default: DIGITS (typically 4).
   */
  digits?: number;
  /**
   * If true, insert thousands separators (commas) into the integer part.
   * Default: false.
   */
  addCommas?: boolean;
  /**
   * If true, amounts smaller than the smallest displayable unit will show
   * a "<0.00...1" format instead of "0.00...0".
   * Default: false.
   */
  showIsLessThanDecimalsLabel?: boolean;
  /**
   * Controls decimal formatting behavior:
   * - If true: pads or trims decimals to exactly `digits` places
   * - If false: trims trailing zeros (natural decimal length)
   * Default: true.
   */
  showLastNonZeroDecimal?: boolean;
}

// Maintain backward compatibility
export interface FormatAmountPropsType extends FormatAmountProps {}

/**
 * Formats blockchain token amounts from their smallest unit representation
 * to human-readable decimal format with configurable precision and formatting options.
 */
export function formatAmount({
  input,
  decimals = DECIMALS,
  digits = DIGITS,
  addCommas = false,
  showIsLessThanDecimalsLabel = false,
  showLastNonZeroDecimal = true
}: FormatAmountProps) {
  if (!stringIsInteger(input, false)) {
    throw new Error('Invalid input');
  }

  const LocalBigNumber = BigNumber.clone();
  LocalBigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_FLOOR });

  const isNegative = LocalBigNumber(input).isNegative();
  const modInput = isNegative ? input.substring(1) : input;

  // Convert from smallest unit to decimal representation
  const decimalAmount = TokenTransfer.fungibleFromBigInteger(
    '',
    modInput,
    decimals
  )
    .amountAsBigInteger.shiftedBy(-decimals)
    .toFixed(decimals);

  const bnBalance = LocalBigNumber(decimalAmount);

  // Handle zero case
  if (bnBalance.isZero()) {
    return ZERO;
  }

  const balance = bnBalance.toString(10);
  const [integerPart, decimalPart = ''] = balance.split('.');
  const bNdecimalPart = LocalBigNumber(decimalPart || 0);

  // Handle case where we have no decimal part or it's all zeros
  if (!decimalPart || bNdecimalPart.isZero()) {
    const formattedInteger = addCommas
      ? LocalBigNumber(integerPart).toFormat()
      : integerPart;
    return isNegative ? `-${formattedInteger}` : formattedInteger;
  }

  // Check if shown decimals would be all zeros within digits precision
  const shownDecimalsAreZero =
    digits >= 1 &&
    digits <= decimalPart.length &&
    LocalBigNumber(decimalPart.substring(0, digits)).isZero();

  let formattedBalance: string;

  if (shownDecimalsAreZero) {
    // Handle case where significant digits are beyond the display precision
    const integerPartZero = LocalBigNumber(integerPart).isZero();

    if (!integerPartZero) {
      // Non-zero integer part: show as "X.000..."
      const zeros = Array(digits).fill(0).join('');
      formattedBalance = addCommas
        ? LocalBigNumber(`${integerPart}.${zeros}`).toFormat(digits)
        : `${integerPart}.${zeros}`;
    } else if (showIsLessThanDecimalsLabel) {
      // Zero integer part with less-than label: show as "<0.00...1"
      const zeroPlaceholders = Array(digits - 1).fill(0);
      const minAmount = [...zeroPlaceholders, 1].join('');
      formattedBalance = `<0.${minAmount}`;
    } else if (!showLastNonZeroDecimal) {
      // showLastNonZeroDecimal=false: trim trailing zeros, show actual significant digits
      const trimmedDecimal = decimalPart.replace(/0+$/, '');
      formattedBalance = addCommas
        ? LocalBigNumber(`0.${trimmedDecimal}`).toFormat()
        : `0.${trimmedDecimal}`;
    } else {
      // showLastNonZeroDecimal=true: show zeros up to digits limit
      const zeros = Array(digits).fill(0).join('');
      formattedBalance = `0.${zeros}`;
    }
  } else {
    // Normal case: we have significant digits within the precision range
    if (showLastNonZeroDecimal) {
      // Pad or trim to exactly `digits` places
      let processedDecimal = decimalPart.substring(0, digits);
      const paddingNeeded = digits - processedDecimal.length;
      if (paddingNeeded > 0) {
        processedDecimal += Array(paddingNeeded).fill(0).join('');
      }

      formattedBalance = addCommas
        ? LocalBigNumber(`${integerPart}.${processedDecimal}`).toFormat(digits)
        : `${integerPart}.${processedDecimal}`;
    } else {
      // Trim trailing zeros (natural decimal length)
      const trimmedDecimal = decimalPart.replace(/0+$/, '');
      formattedBalance = addCommas
        ? LocalBigNumber(`${integerPart}.${trimmedDecimal}`).toFormat()
        : `${integerPart}.${trimmedDecimal}`;
    }
  }

  return isNegative ? `-${formattedBalance}` : formattedBalance;
}
