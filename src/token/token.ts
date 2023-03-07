import { allTokens } from '@/src/token/tokenLists';

/**
 * Get Token details
 */
export function getTokenFromList(symbol: string, chainId: number) {
  let inSymbol: string;
  switch (symbol.toUpperCase()) {
    case 'ETH':
      inSymbol = 'WETH';
      break;
    case 'XDAI':
      inSymbol = 'WXDAI';
      break;
    case 'MATIC':
      inSymbol = 'WMATIC';
      break;
    default:
      inSymbol = symbol.toUpperCase();
  }

  const token = allTokens.find(
    (o) => o.symbol === inSymbol && o.chainId === chainId
  );

  if (!token)
    throw new Error(`Token ${inSymbol} not found for chainId ${chainId}`);
  return token;
}
