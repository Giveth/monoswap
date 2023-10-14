import { getTokenPrices } from '@/index';
import { expect } from 'chai';

describe('Ethereum Classic network support', async () => {
  it('should return the correct price for a token pair', async () => {
    const etcPrice = await getTokenPrices('ETC', ['HEBE'], 61);
    expect(etcPrice[0]).greaterThan(0);
  });
});
