import SdkV2 from '../src/sdk/sdkV2';

describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', async function () {
      // try {
      //   const pair = await getPairFromSymbols('PAN', 'USDT', 1)
      //   assert.equal(pair, 1)
      // } catch (e) {
      //   console.error('Pair doesnt exist')
      // }
      const nowStamp = Date.now();
      console.log(`nowStamp ---> : ${nowStamp}`);
      const sdkV2 = new SdkV2(1);
      const priceUsd = await sdkV2.getTokenPriceFromNativeTokenPrice(
        'PAN',
        'USD',
        nowStamp
      );
      console.log(`priceUsd ---> : ${priceUsd}`);
    });
  });
});
