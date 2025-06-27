import { TokenTransfer } from '@multiversx/sdk-core';
import BigNumber from 'bignumber.js';
import { DECIMALS, DIGITS, ZERO } from '../constants';
import { stringIsInteger } from './stringIsInteger';

/**
 * Configuration options for formatting blockchain token amounts.
 */
export interface FormatAmountProps {
  /**
   * The raw integer amount (string) in the smallest token unit.
   * Must be a valid integer string (no decimals, may include leading "-").
   *
   * @example
   * // For 1.5 EGLD (18 decimals): "1500000000000000000"
   * // For 1000 USDC (6 decimals): "1000000000"
   */
  input: string;

  /**
   * Number of decimals defined by the token (e.g. 18 for EGLD, 6 for USDC).
   * This determines how many decimal places to shift when converting from
   * the smallest unit to the human-readable format.
   *
   * @default DECIMALS (typically 18)
   * @example
   * // EGLD: 18, USDC: 6
   */
  decimals?: number;

  /**
   * Maximum number of decimal digits to display in the formatted output.
   * This parameter works differently depending on `showLastNonZeroDecimal`:
   * - When `showLastNonZeroDecimal=false`: strictly limits decimal places
   * - When `showLastNonZeroDecimal=true`: ignored for truncation, but affects special cases
   *
   * @default DIGITS (typically 4)
   * @example
   * // digits=4 with showLastNonZeroDecimal=false: "1.2345"
   * // digits=4 with showLastNonZeroDecimal=true: "1.23456789"
   */
  digits?: number;

  /**
   * If true, insert thousands separators (commas) into the integer part.
   * Only affects the integer portion, not the decimal places.
   *
   * @default false
   * @example
   * // false: "1000.5"
   * // true: "1,000.5"
   */
  addCommas?: boolean;

  /**
   * If true, amounts smaller than the smallest displayable unit will show
   * a less-than format instead of zero.
   *
   * @default false
   * @example
   * // For very small amounts with digits=4:
   * // false: "0.0000"
   * // true: "<0.0001"
   */
  showIsLessThanDecimalsLabel?: boolean;

  /**
   * Controls the primary decimal formatting behavior:
   *
   * - **`true`** (default): Shows the maximum of either all non-zero decimal places OR `digits` places.
   *   When decimals are present, ensures minimum width while preserving precision.
   *
   * - **`false`**: Pads or trims to exactly `digits` decimal places (fixed-width formatting).
   *   This prioritizes consistent formatting over precision.
   *
   * @default true
   * @example
   * // Input: "1123456789000000000" (1.123456789 EGLD), digits=4
   * // showLastNonZeroDecimal=true:  "1.123456789" (more than 4 digits, show all)
   * // showLastNonZeroDecimal=false: "1.1234"      (exactly 4 digits)
   *
   * // Input: "1100000000000000000" (1.1 EGLD), digits=4
   * // showLastNonZeroDecimal=true:  "1.1000"      (less than 4 digits, pad to 4)
   * // showLastNonZeroDecimal=false: "1.1000"      (exactly 4 digits)
   *
   * // Input: "1000000000000000000" (1 EGLD), digits=4
   * // showLastNonZeroDecimal=true:  "1"           (integer, no decimals added)
   * // showLastNonZeroDecimal=false: "1"           (integer, no decimals added)
   */
  showLastNonZeroDecimal?: boolean;
}

// Maintain backward compatibility
export interface FormatAmountPropsType extends FormatAmountProps {}

/**
 * Formats blockchain token amounts from their smallest unit representation
 * to human-readable decimal format with configurable precision and formatting options.
 *
 * This function handles the conversion from raw integer token amounts (as stored on blockchain)
 * to human-readable decimal format with proper formatting, precision control, and edge case handling.
 *
 * @param props - Configuration object with formatting options
 * @returns Formatted string representation of the amount
 *
 * @throws {Error} When input is not a valid integer string
 *
 * @example
 * // Basic usage - 1.5 EGLD
 * formatAmount({ input: "1500000000000000000" })
 * // Returns: "1.5"
 *
 * @example
 * // With precision control
 * formatAmount({
 *   input: "1123456789000000000",
 *   showLastNonZeroDecimal: false,
 *   digits: 4
 * })
 * // Returns: "1.1234"
 *
 * @example
 * // With thousands separators
 * formatAmount({
 *   input: "1000000000000000000000",
 *   addCommas: true
 * })
 * // Returns: "1,000"
 *
 * @example
 * // Custom token with 6 decimals (USDC)
 * formatAmount({
 *   input: "1500000",
 *   decimals: 6
 * })
 * // Returns: "1.5"
 *
 * @example
 * // Very small amounts with less-than label
 * formatAmount({
 *   input: "1",
 *   decimals: 18,
 *   digits: 4,
 *   showIsLessThanDecimalsLabel: true
 * })
 * // Returns: "<0.0001"
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
  const decimalAmount = TokenTransfer.fungibleFromBigInteger(
    '',
    modInput,
    decimals
  )
    .amountAsBigInteger.shiftedBy(-decimals)
    .toFixed(decimals);

  const bnBalance = LocalBigNumber(decimalAmount);

  if (bnBalance.isZero()) {
    return ZERO;
  }

  const balance = bnBalance.toString(10);
  const [integerPart, decimalPart = ''] = balance.split('.');
  const bNdecimalPart = LocalBigNumber(decimalPart || 0);

  // Handle whole numbers (no decimal part or all zeros)
  if (!decimalPart || bNdecimalPart.isZero()) {
    const formattedInteger = addCommas
      ? LocalBigNumber(integerPart).toFormat()
      : integerPart;
    return isNegative ? `-${formattedInteger}` : formattedInteger;
  }

  // Special case: Check if all displayable digits would be zero
  // This handles very small amounts like 0.00001 when digits=4
  const shownDecimalsAreZero =
    digits >= 1 &&
    digits <= decimalPart.length &&
    LocalBigNumber(decimalPart.substring(0, digits)).isZero();

  let formattedBalance: string;

  if (shownDecimalsAreZero) {
    // Handle edge cases where significant digits are beyond display precision
    const integerPartZero = LocalBigNumber(integerPart).isZero();

    if (!integerPartZero) {
      // Case: "X.00000..." - non-zero integer with insignificant decimals
      const zeros = Array(digits).fill(0).join('');
      formattedBalance = addCommas
        ? LocalBigNumber(`${integerPart}.${zeros}`).toFormat(digits)
        : `${integerPart}.${zeros}`;
    } else if (showIsLessThanDecimalsLabel) {
      // Case: Very small amount with less-than label - show "<0.0001"
      const zeroPlaceholders = Array(digits - 1).fill(0);
      const minAmount = [...zeroPlaceholders, 1].join('');
      formattedBalance = `<0.${minAmount}`;
    } else if (!showLastNonZeroDecimal) {
      // Case: showLastNonZeroDecimal=false - pad to exactly digits places
      const zeros = Array(digits).fill(0).join('');
      formattedBalance = addCommas
        ? LocalBigNumber(`0.${zeros}`).toFormat(digits)
        : `0.${zeros}`;
    } else {
      // Case: showLastNonZeroDecimal=true - show max(all non-zero decimals, digits)
      const trimmedDecimal = decimalPart.replace(/0+$/, '');
      const finalDecimal =
        trimmedDecimal.length >= digits
          ? trimmedDecimal
          : trimmedDecimal +
            Array(digits - trimmedDecimal.length)
              .fill(0)
              .join('');

      formattedBalance = addCommas
        ? LocalBigNumber(`0.${finalDecimal}`).toFormat()
        : `0.${finalDecimal}`;
    }
  } else {
    // Normal case: we have significant digits within the display precision
    if (showLastNonZeroDecimal) {
      // Show the maximum of (all non-zero decimals, digits) - precision with minimum width
      const trimmedDecimal = decimalPart.replace(/0+$/, '');
      const finalDecimal =
        trimmedDecimal.length >= digits
          ? trimmedDecimal
          : trimmedDecimal +
            Array(digits - trimmedDecimal.length)
              .fill(0)
              .join('');

      formattedBalance = addCommas
        ? LocalBigNumber(`${integerPart}.${finalDecimal}`).toFormat()
        : `${integerPart}.${finalDecimal}`;
    } else {
      // Pad or trim to exactly `digits` places (fixed width formatting)
      let processedDecimal = decimalPart.substring(0, digits);
      const paddingNeeded = digits - processedDecimal.length;
      if (paddingNeeded > 0) {
        processedDecimal += Array(paddingNeeded).fill(0).join('');
      }
      formattedBalance = addCommas
        ? LocalBigNumber(`${integerPart}.${processedDecimal}`).toFormat(digits)
        : `${integerPart}.${processedDecimal}`;
    }
  }

  return isNegative ? `-${formattedBalance}` : formattedBalance;
}
