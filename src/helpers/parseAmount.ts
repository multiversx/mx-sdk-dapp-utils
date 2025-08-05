import BigNumber from 'bignumber.js';
import { DECIMALS } from '../constants';

export function parseAmount(amount: string, numDecimals: number = DECIMALS) {
  const amountBN = new BigNumber(amount);
  const multiplier = new BigNumber(10).pow(numDecimals);
  const result = amountBN.multipliedBy(multiplier);

  if (!result.isInteger()) {
    throw new Error('Amount has too many decimal places');
  }

  return result.toFixed(0);
}
