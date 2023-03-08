import config from './config';
import { ethers } from 'ethers';
import { allTokens } from './src/token/tokenLists';
import { CHAIN_ID, SdkFactory } from '@/src/sdk/sdkFactory';

export { pairs as monoswapPairs } from './src/pairs/monoswapPairs';
export { getTokenFromList } from '@/src/token/token';

const INFURA_ID = config.get('ETHEREUM_NODE_ID') as string;

export function getProvider(network: number) {
  if (network === CHAIN_ID.XDAI) {
    return new ethers.providers.JsonRpcProvider(
      config.get('XDAI_NODE_HTTP_URL').toString()
    );
  }
  return new ethers.providers.InfuraProvider(network, INFURA_ID);
}

export function getOurTokenList() {
  return allTokens;
}

export async function getTokenPrices(
  symbol: string,
  baseSymbols: string[],
  chainId: number
) {
  return new Promise((resolve: (prices: number[]) => void, reject) => {
    const pricePromises = baseSymbols.map((base) =>
      getTokenPrice(symbol, base, chainId)
    );
    Promise.all(pricePromises)
      .then((prices: number[]) => {
        resolve(prices);
      })
      .catch(reject);
  });
}

export async function getTokenPrice(
  symbol: string,
  baseSymbol: string,
  chainId: number
): Promise<number> {
  return SdkFactory.getSdk(chainId).getTokenPrice(symbol, baseSymbol);
}
