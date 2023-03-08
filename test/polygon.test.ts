import { getTokenPrices } from '@/index';
import { assert, expect } from 'chai';

describe('Polygon network support', async () => {
  it('should return the correct price for a token pair', async () => {
    const [wrappedMaticPrice] = await getTokenPrices('WMATIC', ['USDT'], 137);
    expect(wrappedMaticPrice).to.gt(0, 'Price should be greater than 0');
  });

  it('should return correct price for native token', async () => {
    const [nativeTokenPrice] = await getTokenPrices('MATIC', ['USDT'], 137);
    const [wrappedTokenPrice] = await getTokenPrices('WMATIC', ['USDT'], 137);

    expect(nativeTokenPrice).to.gt(
      0,
      'Native token price should be greater than 0'
    );
    expect(wrappedTokenPrice).to.gt(
      0,
      'Wrapped token price should be greater than 0'
    );

    expect(wrappedTokenPrice).to.closeTo(
      nativeTokenPrice,
      0.001,
      'Wrapped and native token prices should be equal'
    );
  });

  it('should calculate reverse price correctly', async () => {
    const [maticPrice] = await getTokenPrices('WMATIC', ['USDT'], 137);
    const [maticPriceReverse] = await getTokenPrices('USDT', ['WMATIC'], 137);

    expect(maticPrice).to.gt(0, 'Wrapped MATIC price should be greater than 0');
    expect(maticPriceReverse).to.gt(
      0,
      'Reverse price should be greater than 0'
    );

    expect(maticPrice * maticPriceReverse).to.closeTo(
      1,
      0.001,
      'Prices should be reverse of each other'
    );
  });
});
