import * as math from 'mathjs'
import { subrange } from './subrange'
import { increaseIndex } from './increaseIndex'

export const checkFilterIndex = (filterIndex: number[], filterSize: number[], inputSize: number[]): boolean => {
  if (filterIndex[0] === -1) { return false }
  let i = filterIndex.length

  while (i) {
    i--
    if (filterIndex[i] + filterSize[i] <= inputSize[i]) {
      return true
    }
  }

  return false
}

export const mapMatrix = (matrix: Array<number | number[] | number[][]>, subrangeSize: number[], step: number, callback: (subrange: Array<number | number[]>) => number | number[] | number[][]): Array<number | number[] | number[][]> => {
  const matrixSize = math.size(matrix as any) as number[]

  const result = []

  let matrixIndex = (new Array(matrixSize.length)).fill(0)

  while (checkFilterIndex(matrixIndex, subrangeSize, matrixSize)) {
    const endIndex = matrixIndex.map((dimensionIndex, index) => dimensionIndex + subrangeSize[index] - 1)
    const subinput = subrange(matrix, matrixIndex, endIndex)
    result.push(callback(subinput))

    matrixIndex = increaseIndex(matrixIndex, matrixSize, step, subrangeSize)
  }

  return result
}
