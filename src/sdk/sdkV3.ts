import { ISdk } from '@/src/sdk/sdkFactory';
import { getTokenFromList } from '@/src/token/token';
import * as UniSdkV3 from '@uniswap/v3-sdk';
import { FeeAmount, Pool } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
import { ethers } from 'ethers';
import { getProvider } from '@/index';
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { CeloChain } from './celo/config';
import { UNIV3_CELO_FACTORY_ADDRESS } from './celo/consts';

interface PoolInfo {
  token0: string;
  token1: string;
  fee: number;
  tickSpacing: number;
  sqrtPriceX96: ethers.BigNumber;
  liquidity: ethers.BigNumber;
  tick: number;
}

export class SdkV3 implements ISdk {
  constructor(public readonly chainId: number) {}

  async getPool(tokenA: Token, tokenB: Token): Promise<Pool> {
    const provider = getProvider(this.chainId);
    if (!provider) {
      throw new Error('No provider');
    }
    const currentPoolAddress = UniSdkV3.computePoolAddress({
      factoryAddress:
        this.chainId === CeloChain.Mainnet
          ? UNIV3_CELO_FACTORY_ADDRESS
          : UniSdkV3.FACTORY_ADDRESS,
      tokenA,
      tokenB,
      fee: FeeAmount.MEDIUM,
    });

    const poolContract = new ethers.Contract(
      currentPoolAddress,
      IUniswapV3PoolABI.abi,
      provider
    );

    const [token0, token1, fee, /*tickSpacing,*/ liquidity, slot0] =
      await Promise.all([
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee(),
        // poolContract.tickSpacing(),
        poolContract.liquidity(),
        poolContract.slot0(),
      ]);

    const poolInfo = {
      token0,
      token1,
      fee,
      // tickSpacing,
      liquidity,
      sqrtPriceX96: slot0[0],
      tick: slot0[1],
    };

    return new Pool(
      tokenA,
      tokenB,
      fee,
      poolInfo.sqrtPriceX96.toString(),
      poolInfo.liquidity.toString(),
      poolInfo.tick
    );
  }

  async getTokenPrice(symbol: string, baseSymbol: string): Promise<number> {
    const symbolInfo = getTokenFromList(symbol, this.chainId);
    const baseSymbolInfo = getTokenFromList(baseSymbol, this.chainId);
    if (!symbolInfo || !baseSymbolInfo) {
      throw new Error('Token not found');
    }

    if (symbolInfo.address === baseSymbolInfo.address) {
      return 1;
    }

    const symbolToken = new Token(
      this.chainId,
      symbolInfo.address,
      symbolInfo.decimals,
      symbolInfo.symbol,
      symbolInfo.name
    );
    const baseSymnolToken = new Token(
      this.chainId,
      baseSymbolInfo.address,
      baseSymbolInfo.decimals,
      baseSymbolInfo.symbol,
      baseSymbolInfo.name
    );
    try {
      const pool = await this.getPool(symbolToken, baseSymnolToken);
      const route = new UniSdkV3.Route([pool], symbolToken, baseSymnolToken);
      return +route.midPrice.toSignificant(6);
    } catch (error) {
      console.error(error);
      return 0;
    }
  }
}
