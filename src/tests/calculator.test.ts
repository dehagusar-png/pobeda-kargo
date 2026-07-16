import { calculatePrice } from '../handlers/calculator';

describe('calculator tests', () => {
  it('should calculate weight price correctly', async () => {
    const result = await calculatePrice(10, 'weight');
    expect(result.pricePerUnit).toBeGreaterThan(0);
    expect(result.total).toBe(10 * result.pricePerUnit);
  });

  it('should calculate volume price correctly', async () => {
    const result = await calculatePrice(0.5, 'volume');
    expect(result.pricePerUnit).toBeGreaterThan(0);
    expect(result.total).toBe(0.5 * result.pricePerUnit);
  });
});
