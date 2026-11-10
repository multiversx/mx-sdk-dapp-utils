import BigNumber from 'bignumber.js';
import { DECIMALS } from '../constants/index.js';

export function parseAmount(amount: string, numDecimals = DECIMALS): string {
  // Isolated constructor: a host app's global BigNumber.config() (e.g. a
  // different ROUNDING_MODE) must not change the amount put in a transaction.
  const LocalBigNumber = BigNumber.clone({
    ROUNDING_MODE: BigNumber.ROUND_HALF_UP
  });
  const result = new LocalBigNumber(amount)
    .shiftedBy(numDecimals)
    .decimalPlaces(0);
  return result.toFixed(0);
}
