import { getTokenPrices } from '@/index';
import { expect } from 'chai';

describe('Celo Alfajores network support', async () => {
  it('should return the correct price for a token stable coin', async () => {
    const prices = await getTokenPrices('cUSD', ['CELO'], 44787);
    expect(prices).to.be.lengthOf(1);
    expect(prices[0]).to.be.greaterThan(0);
    console.log(prices);
  });
  it('should return the correct price for CELO', async () => {
    const prices = await getTokenPrices('CELO', ['cUSD'], 44787);
    console.log(prices);
    expect(prices).to.be.lengthOf(1);
    expect(prices[0]).to.be.greaterThan(0);
  });
  it('should return correct price for cUSD to cEUR', async () => {
    const prices = await getTokenPrices('cUSD', ['cEUR'], 44787);
    expect(prices).to.be.lengthOf(1);
    expect(prices[0]).to.be.greaterThan(0);
    console.log(prices);
  });
  it('should return correct price for cEUR to cUSD', async () => {
    const prices = await getTokenPrices('cEUR', ['cUSD'], 44787);
    expect(prices).to.be.lengthOf(1);
    expect(prices[0]).to.be.greaterThan(0);
    console.log(prices);
  });
  it('should return correct price for cUSD to cEUR and cREAL', async () => {
    const prices = await getTokenPrices('cUSD', ['cEUR', 'cREAL'], 44787);
    expect(prices).to.be.lengthOf(2);
    expect(prices[0]).to.be.greaterThan(0);
    expect(prices[1]).to.be.greaterThan(0);
    console.log(prices);
  });
});

describe('Celo network support', async () => {
  it('should return the correct price for a token stable coin', async () => {
    const prices = await getTokenPrices('cUSD', ['CELO'], 42220);
    expect(prices).to.be.lengthOf(1);
    expect(prices[0]).to.be.greaterThan(0);
    console.log(prices);
  });
  it('should return the correct price for CELO', async () => {
    const prices = await getTokenPrices('CELO', ['cUSD'], 42220);
    expect(prices).to.be.lengthOf(1);
    expect(prices[0]).to.be.greaterThan(0);
    console.log(prices);
  });
  it('should return correct price for cUSD to cEUR', async () => {
    const prices = await getTokenPrices('cUSD', ['cEUR'], 42220);
    expect(prices).to.be.lengthOf(1);
    expect(prices[0]).to.be.greaterThan(0);
    console.log(prices);
  });
  it('should return correct price for cEUR to cUSD', async () => {
    const prices = await getTokenPrices('ceur', ['cusd'], 42220);
    expect(prices).to.be.lengthOf(1);
    expect(prices[0]).to.be.greaterThan(0);
    console.log(prices);
  });
  it('should return correct price for NCT token', async () => {
    const prices = await getTokenPrices('NCT', ['CELO'], 42220);
    expect(prices[0]).to.be.greaterThan(0);
    console.log(prices);
  });
  it('should return correct price for ETHIX token', async () => {
    const prices = await getTokenPrices('ETHIX', ['CELO'], 42220);
    expect(prices[0]).to.be.greaterThan(0);
    console.log(prices);
  });
  it('should return correct price for PLASTIK token', async () => {
    const prices = await getTokenPrices('PLASTIK', ['CELO'], 42220);
    expect(prices[0]).to.be.greaterThan(0);
    console.log(prices);
  });
});
