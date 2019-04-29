export type KeyedDictionary<K extends keyof any, T> = { [P in K]?: T }

export interface Dictionary<T> {
  [symbol: string]: T
}
