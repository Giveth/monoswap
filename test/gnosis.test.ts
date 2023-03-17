import { getTokenPrices } from '@/index';
describe('Gnosis network support', async () => {
  it('should return the correct price for a token pair', async () => {
    const prices = await getTokenPrices('GIV', ['WXDAI', 'WETH'], 100);
    console.log(prices);
  });
});
