import * as UniSdk from '@uniswap/sdk';
import * as HoneySdk from 'honeyswap-sdk';
import * as PancakeSdk from '@pancakeswap-libs/sdk';
import * as EtcSwapSdk from 'etcswap-sdk';
import {
  CHAIN_ID,
  getETHisETHPrice,
  getNativeToken,
  ISdk,
  isETHisETH,
  isXDAIisXDAI,
} from '@/src/sdk/sdkFactory';
import { allTokens } from '@/src/token/tokenLists';
import { fetchSwapForPair } from '@/theGraph';
import { getPriceFromSwap } from '@/src/price';
import { getTokenFromList, Token } from '@/src/token/token';
import { getProvider } from '@/index';

type SwapToken = {
  decimals: number;
  symbol: string;
  name: string;
  chainId: number;
  address: string;
};

export default class SdkV2 implements ISdk {
  sdk: { Token; Route; Pair; Fetcher; Trade; WETH; TokenAmount; TradeType };

  constructor(public chainId: number) {
    this.chainId = chainId;
    this.getSwapSdk(chainId);
  }

  getSwapSdk(chainId) {
    switch (chainId) {
      case CHAIN_ID.MAINNET:
      case CHAIN_ID.ROPSTEN:
      case CHAIN_ID.POLYGON:
        this.sdk = UniSdk;
        break;
      case CHAIN_ID.XDAI:
        this.sdk = HoneySdk;
        break;
      case CHAIN_ID.GOERLI:
        this.sdk = PancakeSdk;
        break;
      case CHAIN_ID.ETC:
        this.sdk = EtcSwapSdk;
        break;
      default:
        throw new Error(`${chainId} is unsupported`);
    }
  }

  createToken(chainId, address, symbol, name, decimals) {
    console.log(
      `{chainId, address, decimals, symbol, name} : ${JSON.stringify(
        { chainId, address, decimals, symbol, name },
        null,
        2
      )}`
    );

    return new this.sdk.Token(chainId, address, decimals, symbol, name);
  }

  getSwapToken(token: Token) {
    if (!token) throw new Error('Cannot swap a nothing');
    const { chainId, address, decimals, symbol, name } = token;

    if (!this.sdk) throw new Error('Sdk not initialised in constructor');
    const { Token } = this.sdk;
    return new Token(chainId, address, decimals, symbol, name);
  }

  getPrice(pair, token) {
    const { Route } = this.sdk;

    const route = new Route([pair], token);
    const price = route.midPrice.toSignificant(6);

    // console.log('JIS inv', route.midPrice.invert().toSignificant(6)) // 0.00496756
    // console.log('price', price) // 201.306

    return Number(price);
  }

  getExecutionPrice(pair, token: SwapToken, amount) {
    console.log('getExecutionPrice');

    const { Route, Trade, WETH, TokenAmount, TradeType } = this.sdk;

    const route = new Route([pair], token);
    // const price = route.midPrice.toSignificant(6)

    // console.log(`route : ${JSON.stringify(route, null, 2)}`)

    // console.log(`this.chainId ---> : ${this.chainId}`)
    // console.log(`amount ---> : ${amount}`)
    // console.log(`typeof amount ---> : ${typeof amount}`)
    // console.log(
    //   `AMOUNT : ${JSON.stringify(
    //     new TokenAmount(token, amount.toString()),
    //     null,
    //     2
    //   )}`
    // )

    const trade = new Trade(
      route,
      new TokenAmount(token, amount.toString()),
      TradeType.EXACT_INPUT
    );
    console.log(`trade : ${JSON.stringify(trade, null, 2)}`);

    console.log(
      `trade : ${JSON.stringify(
        trade.executionPrice.toSignificant(6),
        null,
        2
      )}`
    );
    console.log(
      `trade.nextMidPrice.toSignificant(6) : ${JSON.stringify(
        trade.nextMidPrice.toSignificant(6),
        null,
        2
      )}`
    );

    return trade;
  }

  async getPair(token0, token1) {
    const provider = getProvider(this.chainId);
    const { Fetcher } = this.sdk;
    return await Fetcher.fetchPairData(token0, token1, provider);
  }

  async getTokenExecutionPrice(
    symbol: string,
    baseSymbol: string,
    amount: number
  ) {
    try {
      const token = this.getSwapToken(getTokenFromList(symbol, this.chainId));

      if (!token) throw Error(`Symbol ${symbol} not found in our token list`);

      const baseToken = await this.getSwapToken(
        getTokenFromList(baseSymbol, this.chainId)
      );
      if (!baseToken)
        throw Error(`BaseSymbol ${baseSymbol} not found in our token list`);

      if (token.address === baseToken.address) return 1;
      const pair = await this.getPair(token, baseToken);
      const price = this.getExecutionPrice(pair, baseToken, amount); // NO await?

      //console.log(`xprice : ${JSON.stringify(price, null, 2)}`)

      return price;
      // return sdk.getPrice(pair, token, chainId)
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async getTokenPrice(symbol: string, baseSymbol: string): Promise<number> {
    try {
      if (isETHisETH(symbol, baseSymbol)) return getETHisETHPrice();
      if (isXDAIisXDAI(symbol, baseSymbol)) return 1;

      const pair = await this.getPairFromSymbols(symbol, baseSymbol);
      // (Mohammad) Look here, we're getting a
      // getReserves() problem when trying to get the pair
      if (pair) {
        const token = await this.getSwapToken(
          getTokenFromList(symbol, this.chainId)
        );
        console.log({ token });
        return this.getPrice(pair, token);
      } else {
        const nowStamp = Date.now();
        const price = this.getTokenPriceFromNativeTokenPrice(
          symbol,
          baseSymbol,
          nowStamp
        );
        return price;
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async getPairFromSymbols(symbol: string, baseSymbol: string) {
    const token = await this.getSwapToken(
      getTokenFromList(symbol, this.chainId)
    );

    if (!token) throw Error(`Symbol ${symbol} not found in our token list`);

    const baseToken = await this.getSwapToken(
      getTokenFromList(baseSymbol, this.chainId)
    );
    if (!baseToken)
      throw Error(`BaseSymbol ${baseSymbol} not found in our token list`);

    if (token.address === baseToken.address) return 1;
    try {
      return this.getPair(token, baseToken);
    } catch (e) {
      return null;
    }
  }

  async getTokenPriceFromNativeTokenPrice(
    fromSymbol: string,
    toSymbol: string,
    timestamp: number
  ) {
    let pair;
    const token = await this.getSwapToken(
      getTokenFromList(fromSymbol, this.chainId)
    );
    try {
      const nativeToken = getNativeToken(this.chainId);
      pair = await this.getPairFromSymbols(fromSymbol, nativeToken);
      const ethPerToken = this.getPrice(pair, token);

      if (toSymbol === 'USD' || toSymbol === 'USDT' || toSymbol === 'USDC') {
        const usdPerNativeToken = await this.convertPriceNativeTokenToUsd(
          ethPerToken,
          timestamp
        );

        return usdPerNativeToken;
      } else {
        throw new Error(
          `Can't convert symbol ${fromSymbol} to base symbol ${toSymbol}`
        );
      }
    } catch (e) {
      console.error(e?.message);
      throw new Error(
        ` getTokenPriceFromEthPrice can't convert symbol ${fromSymbol} to ${toSymbol} sdkPairs is ${pair}`
      );
    }
  }

  async getTokenFromAddress(address: string) {
    //const tokenFromList = getTokenFromList(symbol, chainId)
    const tokenFromList = allTokens.find(
      (o) =>
        o.address.toLowerCase() === address.toLowerCase() &&
        o.chainId === this.chainId
    );
    //console.log(`tokenFromList : ${JSON.stringify(tokenFromList, null, 2)}`)

    let token;
    if (tokenFromList) {
      token = await this.getSwapToken(tokenFromList);
    } else {
      console.error(`WARNING unknown address ${address}`);
      token = await this.createToken(1, address, 'DUNNO', 'dont know', 18);
    }

    return token;
  }

  async getTokenPriceFromAddress(address: string, baseSymbol: string) {
    try {
      const token = await this.getTokenFromAddress(address);

      const baseTokenFromList = await getTokenFromList(
        baseSymbol,
        this.chainId
      );
      //const baseToken = await getTokenFromAddress(address, chainId)
      const baseToken = await this.getSwapToken(baseTokenFromList);
      if (!baseToken)
        throw Error(`BaseSymbol ${baseSymbol} not found in our token list`);

      if (address === baseToken.address) return 1;
      const provider = getProvider(this.chainId);

      const pair = await this.getPair(token, baseToken);

      return this.getPrice(pair, token);
    } catch (error) {
      console.log(
        `Warning, no price for:  ---> : ${address}, ${baseSymbol} - ${this.chainId}`
      );

      // There may be no pair so return 0
      // console.error(error)
      // throw new Error(error)
    }
  }

  async getPriceAtTime(from: string, to: string, timestamp: number) {
    const pair = await this.getPairFromSymbols(from, to);

    if (!pair)
      throw new Error(
        `No pair found from ${from} to ${to} and chainID ${this.chainId}`
      );

    const quoteToken =
      pair.tokenAmounts[0].token.symbol === from ? 'from' : 'to';

    ///console.log(`quoteToken ---> : ${quoteToken}`)
    // console.log(`pair : ${JSON.stringify(pair, null, 2)}`)

    // console.log(`pair.address ---> : ${pair.liquidityToken.address}`)
    // console.log(`timestamp ---> : ${timestamp}`)
    // console.log(`chainId ---> : ${chainId}`)
    const swap = await fetchSwapForPair(
      pair.liquidityToken.address.toLowerCase(),
      Math.round(timestamp),
      this.chainId
    );

    const price = getPriceFromSwap(swap, to);
    // const action = getActionFromSwap(swap, to)

    // let action: string = ''
    // let price: number = 0

    // if (Number(swap.amount0In) > 0) {
    //   action = 'buyEth ' + Number(swap.amount0In)
    //   price = Number(swap.amount0In) / Number(swap.amount1Out)
    // } else if (Number(swap.amount0Out) > 0) {
    //   action = 'sellEth ' + Number(swap.amount0Out)
    //   price = Number(swap.amount0Out) / Number(swap.amount1In)
    // } else {
    //   throw new Error('Should not happen')
    // }

    return quoteToken === 'from' ? price : 1 / price;
  }

  async getTokenExecutionPriceFromAddress(
    address: string,
    baseSymbol: string,
    chainId: number,
    amount: number
  ) {
    try {
      const token = await this.getTokenFromAddress(address);
      if (!token)
        throw Error(
          `Can't find a token for address ${address} not found in our token list`
        );

      const baseToken = await this.getTokenFromAddress(address);
      if (!baseToken)
        throw Error(`BaseSymbol ${baseSymbol} not found in our token list`);

      if (token.address === baseToken.address) return 1;
      const provider = getProvider(chainId);
      const pair = await this.getPair(token, baseToken);
      const price = this.getExecutionPrice(pair, baseToken, amount); // NO await?

      return price;
      // return sdk.getPrice(pair, token, chainId)
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  async getPairFromAddresses(addresses: string[]) {
    const tokensPromises = addresses.map(
      async (address) => await this.getTokenFromAddress(address)
    );

    const tokens = await Promise.all(tokensPromises);

    const pair = await this.getPair(tokens[0], tokens[1]);

    return pair;
  }

  async convertPriceNativeTokenToUsd(priceInEth, timeStamp): Promise<number> {
    const nativeToken = getNativeToken(this.chainId);
    const priceEthUsdAtTime: number = await this.getPriceAtTime(
      nativeToken,
      'USDT',
      timeStamp
    );

    const usdPerEth = 1 / priceEthUsdAtTime;
    const priceEth = priceInEth * usdPerEth;

    return priceEth;
  }

  async getTokenPricesFromAddress(
    address: string,
    baseSymbols: string[],
    chainId: number
  ) {
    return new Promise((resolve: (prices: number[]) => void, reject) => {
      const pricePromises = baseSymbols.map((base) =>
        this.getTokenPriceFromAddress(address, base)
      );
      Promise.all(pricePromises)
        .then((prices: number[]) => {
          resolve(prices);
        })
        .catch(reject);
    });
  }
}
