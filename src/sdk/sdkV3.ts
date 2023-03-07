import { ISdk } from '@/src/sdk/sdkFactory';
import * as UniSdkV3 from '@uniswap/v3-sdk';

export class SdkV3 implements ISdk {
  constructor(public readonly chainId: number) {}

  getTokenPrice(symbol: string, baseSymbol: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
