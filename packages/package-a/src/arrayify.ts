import { isNil } from 'lodash-es'

export type None = null | undefined

/**
 * 参数类型
 *
 * @public
 */
export type ArgumentType<T = unknown> = T extends None
  ? []
  : T extends unknown[]
  ? T
  : [T]

/**
 * 数组化操作
 *
 * @public
 * @param value - 值
 * @returns 返回数组
 *
 * @example <caption>基础数据</caption>
 *
 * ```js
 * arrayify('foo')
 * // ['foo']
 *
 * arrayify(1)
 * // [1]
 *
 * arrayify('foo')
 * // ['foo']
 *
 * arrayify(['foo', 'bar'])
 * // ['foo', 'bar']
 * ```
 *
 * @example <caption>空值</caption>
 *
 * ```js
 * arrayify(undefined)
 * // []
 *
 * arrayify(null)
 * // []
 * ```
 */
export function arrayify<T, U = ArgumentType<T>>(value?: T): U {
  if (isNil(value)) return [] as unknown as U
  if (Array.isArray(value)) return value as unknown as U
  return [value] as unknown as U
}
