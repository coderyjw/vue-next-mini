import { Dep, createDep } from './dep'
import { ComputedRefImpl } from './computed'

type KeyToDepMap = Map<any, Dep>

/**
 * 单例的，当前的 effect
 */
export let activeEffect: ReactiveEffect | undefined

/**
 * 收集所有依赖的 WeakMap 实例
 * 1. key: 响应性对象
 * 2. value: Map 对象
 *    1. key: 响应性对象的指定属性
 *    2. value: 指定对象的指定属性和执行函数
 */
const targetMap = new WeakMap<any, KeyToDepMap>()

/**
 * 用于收集依赖的方法
 * @param target WeakMap 的 key
 * @param key 代理对象的 key，当依赖触发时，需要根据该 key 获取
 */
export function track(target: object, key: unknown) {
  // 如果当前不存在执行函数，则直接 return
  if (!activeEffect) return
  // 尝试从 targetMap 中，根据 target 获取 map
  let depsMap = targetMap.get(target)
  // 如果获取到的 map 不存在，则生成新的 map 对象， 并把该对象赋值给对应的 value
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  // 如果 dep 不存在， 则生成一个新的 dep， 并放入到deosMap 中
  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }

  trackEffects(dep)
}

/**
 * 利用 dep 依此跟踪 key 的所有 effect
 * @param dep
 */
export function trackEffects(dep: Dep) {
  dep.add(activeEffect!)
}

/**
 * 触发依赖的方法
 * @param target WeakMap 的 key
 * @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
 * @param newValue 指定 key 的最新值
 */
export function trigger(target: object, key: unknown) {
  // 依据 target 获取存储的 map 实例
  const depsMap = targetMap.get(target)
  // 如果 map 不存在，则直接 return
  if (!depsMap) {
    return
  }
  // 依据指定的 key，获取 dep 实例
  let dep: Dep | undefined = depsMap.get(key)
  console.log({ dep })
  // dep 不存在则直接 return
  if (!dep) {
    return
  }
  // 触发 dep
  triggerEffects(dep)
}

/**
 * 响应性触发依赖时的执行类
 */
export class ReactiveEffect<T = any> {
  constructor(
    public fn: () => T,
    public scheduler: EffectScheduler | null = null
  ) {}

  /**
   * 存在该属性，则表示当前的 effect 为计算属性的 effect
   */
  computed?: ComputedRefImpl<T>

  run() {
    // 为 activeEffect 赋值
    activeEffect = this

    // 执行 fn 函数
    return this.fn()
  }
}

/**
 * effect 函数
 * @param fn 执行方法
 * @returns 以 ReactiveEffect 实例为 this 的执行函数
 */
export function effect<T = any>(fn: () => T) {
  // 生成 ReactiveEffect 实例
  const _effect = new ReactiveEffect(fn)
  // 执行 run 函数
  _effect.run()
}

/**
 * 依次触发 dep 中保存的依赖
 */
export function triggerEffects(dep: Dep) {
  // 把 dep 构建为一个数组
  const effects = Array.isArray(dep) ? dep : [...dep]
  // 依次触发
  for (const effect of effects) {
    triggerEffect(effect)
  }
}

/**
 * 触发指定依赖
 */
export function triggerEffect(effect: ReactiveEffect) {
  // 存在调度器就执行调度函数
  if (effect.scheduler) {
    effect.scheduler()
  }
  // 否则直接执行 run 函数即可
  else {
    effect.run()
  }
}

export type EffectScheduler = (...args: any[]) => any
