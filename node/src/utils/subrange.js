import math from 'mathjs'

export const subrange = (matrix, startIndex: number[], endIndex: number[]) => {
  if (startIndex.length !== endIndex.length) {
    throw new Error('Start and End indexes have different dimensions')
  }

  startIndex.forEach((item, index) => {
    if (item > endIndex[index]) throw new Error('Sart index is less then End index')
  })

  if (math.size(matrix).length < startIndex.length) {
    throw new Error('Matrix dimension less than index dimension')
  }

  if (startIndex.length === 0) return matrix

  return matrix.slice(startIndex[0], endIndex[0] + 1).map(subMatrix =>
    subrange(subMatrix, startIndex.slice(1), endIndex.slice(1))
  )
}
