import { ISdk } from '@/src/sdk/sdkFactory';
import SdkV2 from './sdkV2';
import {
  CeloToken,
  getCeloNativeTokens,
  getCeloBridgedTokens,
} from '@/src/sdk/celo/tokens';
import { ExchangeRate } from '@/src/sdk/celo/types';
import { BigNumber, BigNumberish, FixedNumber } from 'ethers';
import { MAX_EXCHANGE_SPREAD, WEI_PER_UNIT } from '@/src/sdk/celo/consts';
import { getContractByAddress } from '@/src/sdk/celo/contracts';
import { fromFixidity, toWei } from '@/src/sdk/celo/amount';

export class SdkCelo implements ISdk {
  constructor(public readonly chainId: number) {}

  async fetchCeloExchangeRate(stableToken: CeloToken): Promise<ExchangeRate> {
    const exchangeAddress = stableToken.exchangeAddress;
    if (!exchangeAddress)
      throw new Error(
        `Token ${stableToken.symbol} has no known exchange address`
      );
    const exchangeContract = getContractByAddress(
      exchangeAddress,
      this.chainId
    );
    if (!exchangeContract)
      throw new Error(`No exchange contract found for ${stableToken.symbol}`);

    const spreadP: Promise<BigNumberish> = exchangeContract.spread();
    const bucketsP: Promise<[BigNumberish, BigNumberish]> =
      exchangeContract.getBuyAndSellBuckets(false);
    const [spreadRaw, bucketsRaw] = await Promise.all([spreadP, bucketsP]);

    const spread = fromFixidity(spreadRaw);
    if (spread <= 0 || spread > MAX_EXCHANGE_SPREAD)
      throw new Error(`Invalid exchange spread: ${spread}`);

    const [celoBucketRaw, stableBucketRaw] = bucketsRaw;
    const celoBucket = BigNumber.from(celoBucketRaw);
    const stableBucket = BigNumber.from(stableBucketRaw);
    if (celoBucket.lte(0) || stableBucket.lte(0))
      throw new Error(
        `Invalid exchange buckets: ${celoBucket.toString()}, ${stableBucket.toString()}`
      );

    return {
      celoBucket: celoBucket.toString(),
      stableBucket: stableBucket.toString(),
      spread: spread.toString(),
      lastUpdated: Date.now(),
    };
  }

  getNativeToken(symbol: string): CeloToken | undefined {
    const celoNativeToken = getCeloNativeTokens(this.chainId);
    return celoNativeToken.find(
      (token) => token.symbol.toLowerCase() === symbol.toLowerCase()
    );
  }
  getBridgedToken(symbol: string): CeloToken | undefined {
    const celoNativeToken = getCeloBridgedTokens(this.chainId);
    return celoNativeToken.find(
      (token) => token.symbol.toLowerCase() === symbol.toLowerCase()
    );
  }
  calcSimpleExchangeRate(
    amountInWei: BigNumberish,
    buyBucket: string,
    sellBucket: string,
    spread: string,
    sellCelo: boolean
  ) {
    try {
      const fromAmountFN = FixedNumber.from(amountInWei);
      const simulate = fromAmountFN.isZero() || fromAmountFN.isNegative();
      // If no valid from amount provided, simulate rate with 1 unit
      const fromAmountAdjusted = simulate
        ? FixedNumber.from(WEI_PER_UNIT)
        : fromAmountFN;

      const reducedSellAmt = fromAmountAdjusted.mulUnsafe(
        FixedNumber.from(1).subUnsafe(FixedNumber.from(spread))
      );
      const toAmountFN = reducedSellAmt
        .mulUnsafe(FixedNumber.from(buyBucket))
        .divUnsafe(reducedSellAmt.addUnsafe(FixedNumber.from(sellBucket)));

      const exchangeRateNum = toAmountFN
        .divUnsafe(fromAmountAdjusted)
        .toUnsafeFloat();
      const exchangeRateWei = toWei(exchangeRateNum);
      const fromCeloRateWei = sellCelo
        ? exchangeRateWei
        : toWei(fromAmountAdjusted.divUnsafe(toAmountFN).toUnsafeFloat());

      // The FixedNumber interface isn't very friendly, need to strip out the decimal manually for BigNumber
      const toAmountWei = BigNumber.from(
        simulate ? 0 : toAmountFN.floor().toString().split('.')[0]
      );

      return { exchangeRateNum, exchangeRateWei, fromCeloRateWei, toAmountWei };
    } catch (error) {
      console.warn('Error computing exchange values');
      return {
        exchangeRateNum: 0,
        exchangeRateWei: '0',
        fromCeloRateWei: '0',
        toAmountWei: '0',
      };
    }
  }

  async getStableTokenPriceToCelo(symbol: string): Promise<number> {
    const token = this.getNativeToken(symbol.toLowerCase());
    if (token) {
      const { celoBucket, stableBucket, spread } =
        await this.fetchCeloExchangeRate(token);
      const exchangeRate = this.calcSimpleExchangeRate(
        WEI_PER_UNIT,
        celoBucket,
        stableBucket,
        spread,
        true
      );
      return exchangeRate.exchangeRateNum;
    } else {
      const bridgedToken = this.getBridgedToken(symbol.toLowerCase());
      console.log({ bridgedToken });
      const sdkV2 = new SdkV2(this.chainId);
      const price = await sdkV2.getTokenPrice(bridgedToken.symbol, 'WETH');
      console.log({ sdkV2, price });
    }
    return 0;
  }

  async getTokenPrice(symbol: string, baseSymbol: string): Promise<number> {
    const symbolLowerCase = symbol.toLowerCase();
    const baseSymbolLowerCase = baseSymbol.toLowerCase();
    if (symbolLowerCase === baseSymbolLowerCase) return 1;
    if (baseSymbolLowerCase === 'celo') {
      return this.getStableTokenPriceToCelo(symbolLowerCase);
    } else if (symbolLowerCase === 'celo') {
      const symbolPrice = await this.getStableTokenPriceToCelo(
        baseSymbolLowerCase
      );
      return symbolPrice > 0 ? 1 / symbolPrice : 0;
    } else {
      const [symbolPrice, baseSymbolPrice] = await Promise.all([
        this.getStableTokenPriceToCelo(symbolLowerCase),
        this.getStableTokenPriceToCelo(baseSymbolLowerCase),
      ]);
      return symbolPrice > 0 && baseSymbolPrice > 0
        ? symbolPrice / baseSymbolPrice
        : 0;
    }
  }
}

export class SdkCeloFactory {
  static chainToSdk: Map<number, SdkCelo> = new Map();

  public static getCeloSdk(chainId: number): SdkCelo {
    if (!this.chainToSdk.has(chainId)) {
      const sdk = new SdkCelo(chainId);
      this.chainToSdk.set(chainId, sdk);
    }
    return this.chainToSdk.get(chainId);
  }
}
