import SdkV2 from '@/src/sdk/sdkV2';
import { SdkV3 } from '@/src/sdk/sdkV3';
import { SdkCeloFactory } from '@/src/sdk/sdkCelo';

export enum CHAIN_ID {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  OPTIMISM = 10,
  KOVAN = 42,
  XDAI = 100,
  BSC = 56,
  POLYGON = 137,
  CELO = 42220,
  ALFAJORES = 44787,
}

export interface ISdk {
  getTokenPrice(symbol: string, baseSymbol: string): Promise<number>;
}

export class SdkV2Factory {
  static chainToSdk: Map<number, SdkV2> = new Map();

  public static getSdkV2(chainId: number): SdkV2 {
    if (!this.chainToSdk.has(chainId)) {
      let sdk: SdkV2;
      switch (chainId) {
        case CHAIN_ID.MAINNET:
        case CHAIN_ID.XDAI:
        case CHAIN_ID.BSC:
        case CHAIN_ID.GOERLI:
        case CHAIN_ID.KOVAN:
        default:
          sdk = new SdkV2(chainId);
          break;
      }
      this.chainToSdk.set(chainId, sdk);
    }
    return this.chainToSdk.get(chainId);
  }
}

export class SdkV3Factory {
  static chainToSdk: Map<number, SdkV3> = new Map();

  public static getSdkV3(chainId: number): SdkV3 {
    if (!this.chainToSdk.has(chainId)) {
      const sdk = new SdkV3(chainId);
      this.chainToSdk.set(chainId, sdk);
    }
    return this.chainToSdk.get(chainId);
  }
}

export class SdkFactory {
  public static getSdk(chainId: number): ISdk {
    switch (chainId) {
      case CHAIN_ID.MAINNET:
      case CHAIN_ID.XDAI:
      case CHAIN_ID.BSC:
      case CHAIN_ID.GOERLI:
      case CHAIN_ID.KOVAN:
        return SdkV2Factory.getSdkV2(chainId);
      case CHAIN_ID.CELO:
      case CHAIN_ID.ALFAJORES:
        return SdkCeloFactory.getCeloSdk(chainId);
      case CHAIN_ID.OPTIMISM:
      case CHAIN_ID.POLYGON:
      default:
        return SdkV3Factory.getSdkV3(chainId);
    }
  }
}

export const isTestPrice = (symbol, baseSymbol) =>
  (symbol === 'ETH' && baseSymbol === 'USDT') ||
  (symbol === 'ETH' && baseSymbol === 'ETH');

export const isETHisETH = (symbol, baseSymbol) =>
  symbol === 'ETH' && baseSymbol === 'ETH';

export const isXDAIisXDAI = (symbol, baseSymbol) =>
  (symbol === 'XDAI' || symbol === 'WXDAI') &&
  (baseSymbol === 'XDAI' || baseSymbol === 'WXDAI');

export const getTestPrice = (symbol, baseSymbol) => {
  if (symbol === 'ETH' && baseSymbol === 'USDT') return 2000;
  if (symbol === 'ETH' && baseSymbol === 'ETH') return 1;
  throw Error('No test price, this should not happen');
};

export const getETHisETHPrice = () => 1;

export const getNativeToken = (chainId: CHAIN_ID) => {
  switch (chainId) {
    case CHAIN_ID.POLYGON:
      return 'MATIC';
    case CHAIN_ID.MAINNET:
    default:
      return 'ETH';
  }
};
