import { getTokenPrices } from '@/index';
describe('Optimism network support', async () => {
  it('should return the correct price for a token pair', async () => {
    const prices = await getTokenPrices('ETH', ['USDT'], 10);
    console.log(prices);
  });
});
