import { TokenTransfer } from '@multiversx/sdk-core';
import BigNumber from 'bignumber.js';
import { pipe } from './pipe';
import { DECIMALS, DIGITS, ZERO } from '../constants';
import { stringIsInteger } from './stringIsInteger';

export interface FormatAmountPropsType {
  addCommas?: boolean;
  decimals?: number;
  digits?: number;
  input: string;
  showIsLessThanDecimalsLabel?: boolean;
  showLastNonZeroDecimal?: boolean;
}

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
        const bNdecimalPart = LocalBigNumber(decimalPart || 0);

        const decimalPlaces = pipe(0)
          .if(Boolean(decimalPart && showLastNonZeroDecimal))
          .then(() => Math.max(decimalPart.length, digits))

          .if(bNdecimalPart.isZero() && !showLastNonZeroDecimal)
          .then(0)

          .if(Boolean(decimalPart && !showLastNonZeroDecimal))
          .then(() => Math.min(decimalPart.length, digits))

          .valueOf();

        const shownDecimalsAreZero =
          decimalPart &&
          digits >= 1 &&
          digits <= decimalPart.length &&
          bNdecimalPart.isGreaterThan(0) &&
          LocalBigNumber(decimalPart.substring(0, digits)).isZero();

        const formatted = bnBalance.toFormat(decimalPlaces);

        const formattedBalance = pipe(balance)
          .if(addCommas)
          .then(formatted)
          .if(Boolean(shownDecimalsAreZero))
          .then((current) => {
            const integerPartZero = LocalBigNumber(integerPart).isZero();
            const [numericPart, decimalSide] = current.split('.');

            const zeroPlaceholders = new Array(digits - 1).fill(0);
            const zeros = [...zeroPlaceholders, 0].join('');
            const minAmount = [...zeroPlaceholders, 1].join(''); // 00..1

            if (!integerPartZero) {
              return `${numericPart}.${zeros}`;
            }

            if (showIsLessThanDecimalsLabel) {
              return `<${numericPart}.${minAmount}`;
            }

            if (!showLastNonZeroDecimal) {
              return numericPart;
            }

            return `${numericPart}.${decimalSide}`;
          })
          .if(Boolean(!shownDecimalsAreZero && decimalPart))
          .then((current) => {
            const [numericPart] = current.split('.');
            let decimalSide = decimalPart.substring(0, decimalPlaces);

            if (showLastNonZeroDecimal) {
              const noOfZerosAtEnd = digits - decimalSide.length;

              if (noOfZerosAtEnd > 0) {
                const zeroPadding = Array(noOfZerosAtEnd).fill(0).join('');
                decimalSide = `${decimalSide}${zeroPadding}`;
                return `${numericPart}.${decimalSide}`;
              }

              return `${numericPart}.${decimalSide.substring(0, digits)}`;
            }

            if (!decimalSide) {
              return numericPart;
            }

            return `${numericPart}.${decimalSide}`;
          })
          .valueOf();

        const parts = formattedBalance.split('.');
        const hasNoDecimals = parts.length === 1;
        const isNotZero = formattedBalance !== ZERO;

        if (digits > 0 && hasNoDecimals && isNotZero) {
          parts.push(ZERO.repeat(digits));
        }

        return parts.join('.');
      })
      .if(isNegative)
      .then((current) => `-${current}`)
      .valueOf()
  );
}
