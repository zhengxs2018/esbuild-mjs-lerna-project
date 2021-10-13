import { toSafeInteger } from 'lodash-es'

export function sum(...args: (number | string)[]): number {
  return args.reduce<number>((a, b) => toSafeInteger(a) + toSafeInteger(b), 0)
}
