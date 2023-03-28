import { Contract, utils } from 'ethers';
import { ABI as AccountsAbi } from './ABIs/accounts';
import { ABI as ElectionAbi } from './ABIs/election';
import { ABI as Erc20Abi } from './ABIs/erc20';
import { ABI as Erc721Abi } from './ABIs/erc721';
import { ABI as EscrowAbi } from './ABIs/escrow';
import { ABI as ExchangeAbi } from './ABIs/exchange';
import { ABI as GoldTokenAbi } from './ABIs/goldToken';
import { ABI as GovernanceAbi } from './ABIs/governance';
import { ABI as LockedGoldAbi } from './ABIs/lockedGold';
import { ABI as SortedOraclesAbi } from './ABIs/sortedOracles';
import { ABI as StableTokenAbi } from './ABIs/stableToken';
import { ABI as ValidatorsAbi } from './ABIs/validators';
import { getProvider } from '@/index';
import { CeloContract } from '@/src/sdk/celo/config';
import { getCeloConfig } from '@/src/sdk/celo/tokens';
import { areAddressesEqual, normalizeAddress } from '@/src/sdk/celo/addresses';

let contractCache: Partial<Record<CeloContract, Contract>> = {};
let tokenContractCache: Partial<Record<string, Contract>> = {}; // token address to contract

export function getContract(c: CeloContract, chainId: number) {
  const cacheKey = c + '-' + chainId;
  const cachedContract = contractCache[cacheKey];
  if (cachedContract) return cachedContract;
  const address = getCeloConfig(chainId).contractAddresses[c];
  const abi = getContractAbi(c);
  const contract = new Contract(address, abi, getProvider(chainId));
  contractCache[cacheKey] = contract;
  return contract;
}

export function getErc20Contract(tokenAddress: string, chainId: number) {
  return getTokenContract(tokenAddress, Erc20Abi, chainId);
}

export function getErc721Contract(tokenAddress: string, chainId: number) {
  return getTokenContract(tokenAddress, Erc721Abi, chainId);
}

// Search for token contract by address
function getTokenContract(tokenAddress: string, abi: string, chainId: number) {
  const normalizedAddr = normalizeAddress(tokenAddress);
  const cachedContract = tokenContractCache[normalizedAddr];
  if (cachedContract) return cachedContract;
  const contract = new Contract(normalizedAddr, abi, getProvider(chainId));
  tokenContractCache[normalizedAddr] = contract;
  return contract;
}

function getContractAbi(c: CeloContract) {
  switch (c) {
    case CeloContract.Accounts:
      return AccountsAbi;
    case CeloContract.Election:
      return ElectionAbi;
    case CeloContract.Escrow:
      return EscrowAbi;
    case CeloContract.Exchange:
    case CeloContract.ExchangeEUR:
    case CeloContract.ExchangeBRL:
      return ExchangeAbi;
    case CeloContract.GoldToken:
      return GoldTokenAbi;
    case CeloContract.Governance:
      return GovernanceAbi;
    case CeloContract.LockedGold:
      return LockedGoldAbi;
    case CeloContract.SortedOracles:
      return SortedOraclesAbi;
    case CeloContract.StableToken:
    case CeloContract.StableTokenEUR:
    case CeloContract.StableTokenBRL:
      return StableTokenAbi;
    case CeloContract.Validators:
      return ValidatorsAbi;
    default:
      throw new Error(`No ABI for contract ${c}`);
  }
}

// Search for core contract by address
export function getContractByAddress(
  address: string,
  chainId: number
): Contract | null {
  const name = getContractName(address, chainId);
  if (name) return getContract(name, chainId);
  else return null;
}

// Search for core contract name by address
export function getContractName(
  address: string,
  chainId: number
): CeloContract | null {
  if (!address) return null;
  const config = getCeloConfig(chainId);
  const contractNames = Object.keys(
    config.contractAddresses
  ) as Array<CeloContract>; // Object.keys loses types
  for (const name of contractNames) {
    const cAddress = config.contractAddresses[name];
    if (areAddressesEqual(address, cAddress)) {
      return name;
    }
  }
  return null;
}

let erc721Interface: utils.Interface;

// Normally, interfaces are retrieved through the getContract() function
// but ERC721 is an exception because no core celo contracts use it
export function getErc721AbiInterface() {
  if (!erc721Interface) {
    erc721Interface = new utils.Interface(Erc721Abi);
  }
  return erc721Interface;
}

// Necessary if the signer changes, as in after a logout
export function clearContractCache() {
  contractCache = {};
  tokenContractCache = {};
}
