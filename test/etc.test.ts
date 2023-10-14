import { getTokenPrices } from '@/index';
import { expect } from 'chai';

describe('Ethereum Classic network support', async () => {
  it('should return the correct price for a token pair', async () => {
    const etcPrice = await getTokenPrices('WETC', ['USDT', 'BUSD'], 61);
    console.log({ etcPrice });
    expect(etcPrice[0]).greaterThan(0);
  });
});
