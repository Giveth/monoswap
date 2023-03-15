import { getTokenPrices } from '@/index';
describe('Mainnet network support', async () => {
  it('should return the correct price for a token pair', async () => {
    const prices = await getTokenPrices('ETH', ['USDT'], 1);
    console.log(prices);
  });
});
