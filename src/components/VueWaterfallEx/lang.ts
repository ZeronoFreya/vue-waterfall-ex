interface AnyObj {
  [key: string]: string | number | boolean;
}

export function getNow() {
  return window.performance && window.performance.now ? (window.performance.now() + window.performance.timing.navigationStart) : +new Date()
}

export function extend(target: AnyObj, ...rest: AnyObj[]) {
  for (let i = 0; i < rest.length; i++) {
    const source = rest[i]
    for (const key in source) {
      target[key] = source[key]
    }
  }
  return target
}
