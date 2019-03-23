
export const mapKeys = <T>(input: { [keys: string]: T}, keyTransformer: (key: string) => string): {[keys: string]: T} => {
  const newMap: {[keys: string]: T} = {}
  Object.keys(input)
    .forEach( (key) => {
      const newKey = keyTransformer(key)
      newMap[newKey] = input[key]
    })
  return newMap
}

export const mapValues = <T, U>(input: { [keys: string]: T}, valueTransformer: (value: T) => U, filterValues?: true): {[keys: string]: U } => {
  const newMap: {[keys: string]: U } = {}
  Object.keys(input)
    .forEach( (key) => {
      const newValue = valueTransformer(input[key])
      if (!!newValue || !filterValues) {
        newMap[key] = newValue
      }
    })
  return newMap
}

export const mapKeysAndValues = <T, U>(input: { [keys: string]: T}, valueTransformer: (key: string, value: T) => U, filterValues?: true): {[keys: string]: U } => {
  const newMap: {[keys: string]: U } = {}
  Object.keys(input)
    .forEach( (key) => {
      const newValue = valueTransformer(key, input[key])
      if (!!newValue || !filterValues) {
        newMap[key] = newValue
      }
    })
  return newMap
}

export const extractKeysAndValues = <T, K extends keyof T>(input: T): Array<{ readonly key: K, readonly value: T[K] }> => {
  return Object.keys(input)
  .map( (key) => ({ key: key as K, value: (input as any)[key] as T[K] }))
}

export const groupByAndMap = <T, U>(fromArray: T[], keyExtractor: (item: T, index: number) => string, transform: (item: T, index: number) => U): {[key: string]: U } => {
  const groupped: {[key: string]: U } = {}
  fromArray.forEach( (item, index) => {
    groupped[keyExtractor(item, index)] = transform(item, index)
  })
  return groupped
}

export const flattenArray = <T>(arrays: T[][]): T[] => {
  return ([] as T[]).concat(...arrays)
}
