import SdkV2 from '@/src/sdk/sdkV2';

export enum CHAIN_ID {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  KOVAN = 42,
  XDAI = 100,
  BSC = 56,
  POLYGON = 137,
}

export interface ISdk {
  getTokenPrice(symbol: string, baseSymbol: string): Promise<number>;
}

export class SdkFactory {
  static chainToSdk: Map<number, ISdk> = new Map();
  public static getSdk(chainId: number): ISdk {
    if (!this.chainToSdk.has(chainId)) {
      let sdk: ISdk;
      switch (chainId) {
        case CHAIN_ID.POLYGON:
          break;
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
