import { TokenTransfer } from '@multiversx/sdk-core';
import BigNumber from 'bignumber.js';
import { DECIMALS, DIGITS, ZERO } from '../constants';
import { stringIsInteger } from './stringIsInteger';
import { pipe } from './pipe';

/**
 * Configuration options for formatting blockchain token amounts.
 */
export interface FormatAmountPropsType {
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
   * // For 1.23456789 EGLD (18 decimals): "1234567890000000000"
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
   * // For 1000.5 EGLD (18 decimals, showLastNonZeroDecimal: true): "1000500000000000000000"
   * // false: "1000"
   * // true: "1,000"
   */
  addCommas?: boolean;

  /**
   * If true, amounts smaller than the smallest displayable unit will show
   * a less-than format instead of zero.
   *
   * @default false
   * @example
   * // For 0.000000000000000001 EGLD (18 decimals, showIsLessThanDecimalsLabel: true): "1"
   * // false: "0.0000"
   * // true: "<0.0001"
   */
  showIsLessThanDecimalsLabel?: boolean;

  /**
   * Controls the primary decimal formatting behavior:
   *
   * - **`true`** (default): When decimals exist, always pad to at least `digits` decimal places.
   *   If there are more significant decimal places than `digits`, show all of them.
   *
   * - **`false`**: When decimals exist, always pad to exactly `digits` decimal places.
   *   Truncate if there are more decimal places than `digits`.
   *
   * @default true
   * @example
   * // For 1.123456789 EGLD (18 decimals, digits=4): "1123456789000000000"
   * // showLastNonZeroDecimal=true:  "1.123456789" (more than 4 digits, show all)
   * // showLastNonZeroDecimal=false: "1.1234"      (exactly 4 digits)
   *
   * // For 1.1 EGLD (18 decimals, digits=4): "1100000000000000000"
   * // showLastNonZeroDecimal=true:  "1.1"         (pad to 4 digits minimum)
   * // showLastNonZeroDecimal=false: "1.1000"      (exactly 4 digits)
   *
   * // For 1 EGLD (18 decimals, digits=4): "1000000000000000000"
   * // showLastNonZeroDecimal=true:  "1"           (integer, no decimals to pad)
   * // showLastNonZeroDecimal=false: "1.0000"      (integer, no decimals to pad)
   *
   * // For 1.0000005 EGLD (18 decimals, digits=4): "1000000500000000000"
   * // showLastNonZeroDecimal=true:  "1.0000005"   (more than 4 digits, show all)
   * // showLastNonZeroDecimal=false: "1.0000"      (exactly 4 digits)
   */
  showLastNonZeroDecimal?: boolean;
}

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
 * // With precision control
 * formatAmount({
 *   input: "1123456789000000000",
 *   showLastNonZeroDecimal: true,
 *   digits: 4
 * })
 * // Returns: "1.123456789"
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
  addCommas = false,
  decimals = DECIMALS,
  digits = DIGITS,
  input,
  showIsLessThanDecimalsLabel = false,
  showLastNonZeroDecimal = true
}: FormatAmountPropsType) {
  if (!stringIsInteger(input, false)) {
    throw new Error('Invalid input');
  }

  const LocalBigNumber = BigNumber.clone();
  LocalBigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_FLOOR });
  const isNegative = LocalBigNumber(input).isNegative();
  let modInput = input;

  if (isNegative) {
    // remove - at start of input
    modInput = input.substring(1);
  }

  return (
    pipe(modInput as string)
      // format
      .then(() =>
        TokenTransfer.fungibleFromBigInteger('', modInput as string, decimals)
          .amountAsBigInteger.shiftedBy(-decimals)
          .toFixed(decimals)
      )
      // format
      .then((current) => {
        const bnBalance = LocalBigNumber(current);

        if (bnBalance.isZero()) {
          return ZERO;
        }

        const balance = bnBalance.toString(10);
        const [integerPart, decimalPart] = balance.split('.');

        // Handle case where there's no decimal part (pure integers)
        if (!decimalPart) {
          if (showLastNonZeroDecimal) {
            // For integers with showLastNonZeroDecimal=true, don't show decimals
            return addCommas
              ? LocalBigNumber(integerPart).toFormat(0)
              : integerPart;
          } else {
            // For showLastNonZeroDecimal=false, don't show decimals for pure integers
            return addCommas
              ? LocalBigNumber(integerPart).toFormat(0)
              : integerPart;
          }
        }

        const bNdecimalPart = LocalBigNumber(decimalPart);

        // Handle case where decimal part is all zeros
        if (bNdecimalPart.isZero()) {
          if (showLastNonZeroDecimal) {
            // For integers with showLastNonZeroDecimal=true, don't show decimals
            return addCommas
              ? LocalBigNumber(integerPart).toFormat(0)
              : integerPart;
          } else {
            // For showLastNonZeroDecimal=false, don't show decimals for effectively integer values
            return addCommas
              ? LocalBigNumber(integerPart).toFormat(0)
              : integerPart;
          }
        }

        // Find the last non-zero decimal position
        const lastNonZeroIndex = decimalPart
          .split('')
          .reverse()
          .findIndex((digit) => digit !== '0');
        const actualDecimalPlaces = decimalPart.length - lastNonZeroIndex;

        let finalDecimalPlaces;
        if (showLastNonZeroDecimal) {
          // Show all decimals if more than digits, otherwise show only the actual non-zero decimals
          finalDecimalPlaces = Math.max(actualDecimalPlaces, 0);
        } else {
          // Show exactly digits decimal places
          finalDecimalPlaces = digits;
        }

        // Handle special case: very small amounts that would round to zero
        const shownDecimalsAreZero =
          digits >= 1 &&
          digits <= decimalPart.length &&
          bNdecimalPart.isGreaterThan(0) &&
          LocalBigNumber(decimalPart.substring(0, digits)).isZero();

        if (shownDecimalsAreZero) {
          const integerPartZero = LocalBigNumber(integerPart).isZero();
          const zeroPlaceholders = new Array(digits - 1).fill(0);
          const zeros = [...zeroPlaceholders, 0].join('');
          const minAmount = [...zeroPlaceholders, 1].join(''); // 00..1

          if (!integerPartZero) {
            const intFormat = addCommas
              ? LocalBigNumber(integerPart).toFormat(0)
              : integerPart;
            return `${intFormat}.${zeros}`;
          }

          if (showIsLessThanDecimalsLabel) {
            const intFormat = addCommas
              ? LocalBigNumber(integerPart).toFormat(0)
              : integerPart;
            return `<${intFormat}.${minAmount}`;
          }

          if (!showLastNonZeroDecimal) {
            return addCommas
              ? LocalBigNumber(integerPart).toFormat(0)
              : integerPart;
          }

          // For showLastNonZeroDecimal=true, show the actual decimals
          const formattedValue = bnBalance.toFixed(finalDecimalPlaces);
          const [, formattedDecimalPart] = formattedValue.split('.');
          const intFormat = addCommas
            ? LocalBigNumber(integerPart).toFormat(0)
            : integerPart;
          return `${intFormat}.${formattedDecimalPart}`;
        }

        // Normal case: format with the calculated decimal places
        let formattedValue;

        if (showLastNonZeroDecimal) {
          // Show actual decimal places without padding for showLastNonZeroDecimal=true
          formattedValue = bnBalance.toFixed(actualDecimalPlaces);
        } else {
          // Show exactly digits decimal places for showLastNonZeroDecimal=false
          formattedValue = bnBalance.toFixed(digits);
        }

        // Apply comma formatting if requested
        if (addCommas) {
          const [intPart, decPart] = formattedValue.split('.');
          const formattedIntPart = LocalBigNumber(intPart).toFormat(0);
          formattedValue = decPart
            ? `${formattedIntPart}.${decPart}`
            : formattedIntPart;
        }

        return formattedValue;
      })
      .if(isNegative)
      .then((current) => `-${current}`)
      .valueOf()
  );
}
