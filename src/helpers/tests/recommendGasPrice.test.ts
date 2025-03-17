import { recommendGasPrice } from '../recommendGasPrice';

describe('recommendGasPrice', () => {
  const MIN_GAS_PRICE = 1_000_000_000;

  describe('when ppu is 0 or undefined', () => {
    it('should return MIN_GAS_PRICE when ppu is 0', () => {
      const result = recommendGasPrice({
        transactionDataLength: 30,
        transactionGasLimit: 45_000_000,
        ppu: 0
      });
      expect(result).toBe(MIN_GAS_PRICE);
    });

    it('should return MIN_GAS_PRICE when ppu is undefined', () => {
      const result = recommendGasPrice({
        transactionDataLength: 30,
        transactionGasLimit: 45_000_000,
        ppu: undefined as any
      });
      expect(result).toBe(MIN_GAS_PRICE);
    });
  });

  describe('when using valid ppu values', () => {
    it('should calculate gas price correctly for small transactions', () => {
      const result = recommendGasPrice({
        transactionDataLength: 30,
        transactionGasLimit: 45_000_000,
        ppu: 11_760_000
      });
      expect(result).toBeGreaterThanOrEqual(MIN_GAS_PRICE);
      expect(result).toBeLessThanOrEqual(MIN_GAS_PRICE * 30);
    });

    it('should handle move balance transaction parameters', () => {
      const result = recommendGasPrice({
        transactionDataLength: 0,
        transactionGasLimit: 50_000,
        ppu: 11_760_000
      });
      expect(result).toBeGreaterThanOrEqual(MIN_GAS_PRICE);
      expect(result).toBeLessThanOrEqual(MIN_GAS_PRICE * 30);
    });

    it('should handle xExchange swap transaction parameters', () => {
      const result = recommendGasPrice({
        transactionDataLength: 143,
        transactionGasLimit: 30_000_000,
        ppu: 1_000_000_000
      });
      expect(result).toBeGreaterThanOrEqual(MIN_GAS_PRICE);
      expect(result).toBeLessThanOrEqual(MIN_GAS_PRICE * 30);
    });
  });

  describe('edge cases', () => {
    it('should handle large data length and small gas limit', () => {
      const result = recommendGasPrice({
        transactionDataLength: 600_000_000,
        transactionGasLimit: 100,
        ppu: 22_760_000
      });
      expect(result).toBeGreaterThanOrEqual(MIN_GAS_PRICE);
      expect(result).toBeLessThanOrEqual(MIN_GAS_PRICE * 30);
    });

    it('should handle small data length and large gas limit', () => {
      const result = recommendGasPrice({
        transactionDataLength: 100,
        transactionGasLimit: 600_000_000,
        ppu: 11_760_000
      });
      expect(result).toBeGreaterThanOrEqual(MIN_GAS_PRICE);
      expect(result).toBeLessThanOrEqual(MIN_GAS_PRICE * 30);
    });
  });

  describe('gas price boundaries', () => {
    it('should cap gas price at MAX_GAS_PRICE when calculated value exceeds maximum', () => {
      const result = recommendGasPrice({
        transactionDataLength: 30,
        transactionGasLimit: 45_000_000,
        ppu: 1_000_000_000_000 // Very high PPU to force MAX_GAS_PRICE
      });
      expect(result).toBe(MIN_GAS_PRICE * 30); // MAX_GAS_PRICE
    });

    it('should use MIN_GAS_PRICE when calculated value is below minimum', () => {
      const result = recommendGasPrice({
        transactionDataLength: 30,
        transactionGasLimit: 45_000_000,
        ppu: 1 // Very low PPU to force MIN_GAS_PRICE
      });
      expect(result).toBe(MIN_GAS_PRICE);
    });
  });
});
