import { getTokenPrices } from '../index';
import assert from 'assert';
describe('Polygon network support', async () => {
  it('should return the correct price for a token pair', async () => {
    const prices = await getTokenPrices('WMATIC', ['USDT'], 137);
    // const prices = await getTokenPrices('ETH', ['USDT'], 1);
    console.log(prices);
  });
});
