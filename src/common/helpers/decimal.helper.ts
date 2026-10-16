import { Decimal } from '@prisma/client/runtime/library';

export function decimalToBigInt(value: Decimal, decimals: number = 18): bigint {
  return BigInt(value.mul(new Decimal(10).pow(decimals)).toFixed(0));
}

export function bigIntToDecimal(value: bigint, decimals: number = 18): Decimal {
  return new Decimal(value.toString()).div(new Decimal(10).pow(decimals));
}
