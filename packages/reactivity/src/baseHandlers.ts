import { track, trigger } from './effect'

/**
 * getter 回调方法
 */
const get = createGetter()
/**
 * 创建 setter 回调方法
 */
const set = createSetter()

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
}

/**
 * 创建 getter 回调方法
 */
function createGetter() {
  return function get(target: object, key: string | symbol, receiver: object) {
    const value = Reflect.get(target, key, receiver)
    track(target, key)
    return value
  }
}

/**
 * 创建 setter 回调方法
 */
function createSetter() {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ) {
    const result = Reflect.set(target, key, value, receiver)

    trigger(target, key)
    return result
  }
}
