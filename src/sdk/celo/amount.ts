import { BigNumber, BigNumberish, ethers, FixedNumber } from 'ethers';
import { STANDARD_TOKEN_DECIMALS } from '@/src/sdk/celo/consts';

export function fromFixidity(value: BigNumberish | null | undefined): number {
  if (!value) return 0;
  return FixedNumber.from(value)
    .divUnsafe(FixedNumber.from('1000000000000000000000000'))
    .toUnsafeFloat();
}

export function toWei(
  value: BigNumberish | null | undefined,
  decimals = STANDARD_TOKEN_DECIMALS
): BigNumber {
  if (!value) return BigNumber.from(0);
  const valueString = value.toString().trim();
  const components = valueString.split('.');
  if (components.length === 1) {
    return ethers.utils.parseUnits(valueString, decimals);
  } else if (components.length === 2) {
    const trimmedFraction = components[1].substring(0, decimals);
    return ethers.utils.parseUnits(
      `${components[0]}.${trimmedFraction}`,
      decimals
    );
  } else {
    throw new Error(`Cannot convert ${valueString} to wei`);
  }
}
