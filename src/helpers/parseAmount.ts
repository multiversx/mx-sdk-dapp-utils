import BigNumber from 'bignumber.js';
import { DECIMALS } from '../constants/index.js';

export function parseAmount(amount: string, numDecimals = DECIMALS): string {
  const result = new BigNumber(amount).shiftedBy(numDecimals).decimalPlaces(0);
  return result.toFixed(0);
}
