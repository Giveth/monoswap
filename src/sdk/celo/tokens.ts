// Copyright (c) 2015-2019 Celo Foundation
// https://github.com/celo-tools/celo-web-wallet

import {
  CeloAlfajoresConfig,
  CeloChain,
  CeloConfig,
  CeloMainnetConfig,
} from '@/src/sdk/celo/config';

export interface CeloToken {
  symbol: string;
  name: string;
  address: string; // contract address
  chainId: number;
  decimals?: number;
  color?: string;
  exchangeAddress?: string; // Mento contract for token
  sortOrder?: number; // for order preference in balance lists
}

export interface TokenWithBalance extends CeloToken {
  value: string;
}

interface CeloTokens {
  CELO: CeloToken;
  cUSD: CeloToken;
  cEUR: CeloToken;
  cREAL: CeloToken;
  USDTet: CeloToken;
  USDC: CeloToken;
  WBTC: CeloToken;
}

export const getCeloConfig = (chainId: number): CeloConfig => {
  switch (chainId) {
    case CeloChain.Mainnet:
      return CeloMainnetConfig;
    case CeloChain.Alfajores:
      return CeloAlfajoresConfig;
    default:
      throw new Error('Invalid chainId');
  }
};

const _getCeloTokens = (chainId: number): CeloTokens => {
  const config = getCeloConfig(chainId);
  return {
    CELO: {
      symbol: 'CELO',
      name: 'Celo Native',
      // color: Color.primaryGold,
      address: config.contractAddresses.GoldToken,
      decimals: 18,
      chainId: config.chainId,
      sortOrder: 10,
    },
    cUSD: {
      symbol: 'cUSD',
      name: 'Celo Dollar',
      // color: Color.primaryGreen,
      address: config.contractAddresses.StableToken,
      decimals: 18,
      chainId: config.chainId,
      exchangeAddress: config.contractAddresses.Exchange,
      sortOrder: 20,
    },
    cEUR: {
      symbol: 'cEUR',
      name: 'Celo Euro',
      // color: Color.primaryGreen,
      address: config.contractAddresses.StableTokenEUR,
      decimals: 18,
      chainId: config.chainId,
      exchangeAddress: config.contractAddresses.ExchangeEUR,
      sortOrder: 30,
    },
    cREAL: {
      symbol: 'cREAL',
      name: 'Celo Brazilian Real',
      // color: Color.primaryGreen,
      address: config.contractAddresses.StableTokenBRL,
      decimals: 18,
      chainId: config.chainId,
      exchangeAddress: config.contractAddresses.ExchangeBRL,
      sortOrder: 40,
    },
    USDTet: {
      symbol: 'USDTet',
      name: 'Tether',
      // color: Color.primaryGreen,
      address: config.contractAddresses.USDTet,
      decimals: 6,
      chainId: config.chainId,
      exchangeAddress: '',
      sortOrder: 40,
    },
    USDC: {
      symbol: 'USDC',
      name: 'USDC',
      address: config.contractAddresses.USDC,
      decimals: 6,
      chainId: config.chainId,
      exchangeAddress: config.contractAddresses.USDCPool,
      sortOrder: 40,
    },
    WBTC: {
      symbol: 'WBTC',
      name: 'Wrapped BTC',
      address: config.contractAddresses.WrappedBTC,
      decimals: 8,
      chainId: config.chainId,
      exchangeAddress: config.contractAddresses.Exchange,
      sortOrder: 40,
    },
  };
};

export const CeloMainnetTokens = _getCeloTokens(CeloChain.Mainnet);
export const CeloAlfajoresTokens = _getCeloTokens(CeloChain.Alfajores);

export const getCeloTokens = (chainId: number): CeloTokens => {
  switch (chainId) {
    case CeloChain.Mainnet:
      return CeloMainnetTokens;
    case CeloChain.Alfajores:
      return CeloAlfajoresTokens;
    default:
      throw new Error('Invalid chainId');
  }
};

export const getCeloNativeTokens = (chainId: number): CeloToken[] => {
  const { CELO, cUSD, cEUR, cREAL } = getCeloTokens(chainId);
  return [CELO, cUSD, cEUR, cREAL];
};

export const getCeloBridgedTokens = (chainId: number): CeloToken[] => {
  const { USDTet, USDC } = getCeloTokens(chainId);
  return [USDTet, USDC];
};

export const getNativeTokenByAddress = (chainId: number) => {
  const { CELO, cUSD, cEUR, cREAL, USDTet, USDC, WBTC } =
    getCeloTokens(chainId);
  return {
    [CELO.address]: CELO,
    [cUSD.address]: cUSD,
    [cEUR.address]: cEUR,
    [cREAL.address]: cREAL,
  };
};

export const getCeloStableTokens = (chainId: number) => {
  const { cUSD, cEUR, cREAL } = getCeloTokens(chainId);
  return [cUSD, cEUR, cREAL];
};

export const getLockedCELO = (chainId: number): CeloToken => {
  const config = getCeloConfig(chainId);
  const { CELO } = getCeloTokens(chainId);

  return {
    ...CELO,
    symbol: 'Locked CELO',
    name: 'Locked CELO',
    address: config.contractAddresses.LockedGold,
    sortOrder: CELO.sortOrder + 1,
  };
};
