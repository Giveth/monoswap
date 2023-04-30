import { getTokenPrices } from '@/index';
import { expect } from 'chai';

describe('Optimism network support', async () => {
  it('should return the correct price for a token pair', async () => {
    const ethPrice = await getTokenPrices('ETH', ['USDT'], 10);
    expect(ethPrice[0]).greaterThan(0);
  });
});
