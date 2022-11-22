/**
 * 用于收集依赖的方法
 * @param target WeakMap 的 key
 * @param key 代理对象的 key，当依赖触发时，需要根据该 key 获取
 */
export function track(target: object, key: unknown) {
  console.log('收集依赖', target, key)
}

/**
 * 触发依赖的方法
 * @param target WeakMap 的 key
 * @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
 * @param newValue 指定 key 的最新值
 */
export function trigger(target: object, key: unknown, newValue: unknown) {
  console.log('触发依赖', target, key, newValue)
}