import config from './config';
import { ethers } from 'ethers';
import { allTokens } from './src/token/tokenLists';
import { CHAIN_ID, SdkFactory } from '@/src/sdk/sdkFactory';
import { CeloAlfajoresConfig, CeloMainnetConfig } from '@/src/sdk/celo/config';

export { pairs as monoswapPairs } from './src/pairs/monoswapPairs';
export { getTokenFromList } from '@/src/token/token';

const INFURA_ID = config.get('INFURA_API_KEY') as string;

export function getProvider(network: number) {
  switch (network) {
    case CHAIN_ID.XDAI:
      return new ethers.providers.JsonRpcProvider(
        config.get('XDAI_NODE_HTTP_URL').toString()
      );
    case CHAIN_ID.OPTIMISM: {
      const customOptimismRpcNode = config
        .get('OPTIMISM_NODE_HTTP_URL')
        ?.toString();
      if (customOptimismRpcNode)
        return new ethers.providers.JsonRpcProvider(customOptimismRpcNode);
      break;
    }
    case CHAIN_ID.POLYGON: {
      const customPolygonRpcNode = config
        .get('POLYGON_MAINNET_NODE_HTTP_URL')
        ?.toString();
      if (customPolygonRpcNode)
        return new ethers.providers.JsonRpcProvider(customPolygonRpcNode);
      break;
    }
    case CHAIN_ID.CELO: {
      const customCeloRpcNode = config
        .get('CELO_MAINNET_NODE_HTTP_URL')
        ?.toString();
      return new ethers.providers.JsonRpcProvider(
        customCeloRpcNode || CeloMainnetConfig.jsonRpcUrlPrimary
      );
    }
    case CHAIN_ID.ALFAJORES: {
      const customCeloAlfajoresRpcNode = config
        .get('CELO_ALFAJORES_NODE_HTTP_URL')
        ?.toString();
      return new ethers.providers.JsonRpcProvider(
        customCeloAlfajoresRpcNode || CeloAlfajoresConfig.jsonRpcUrlPrimary
      );
    }
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
