import BigNumber from 'bignumber.js';

export const stringIsInteger = (
  integer: string,
  positiveNumbersOnly = true
) => {
  const stringInteger = String(integer);
  if (!stringInteger.match(/^[-]?\d+$/)) {
    return false;
  }
  const bNparsed = new BigNumber(stringInteger);
  if (positiveNumbersOnly) {
    return (
      bNparsed.toString(10) === stringInteger &&
      bNparsed.isGreaterThanOrEqualTo(0)
    );
  }

  return bNparsed.toString(10) === stringInteger;
};
