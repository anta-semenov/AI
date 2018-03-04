import math from 'mathjs'
import {subrange} from './subrange'
import {increaseIndex} from './increaseIndex'

export const checkFilterIndex = (filterIndex, filterSize, inputSize) => {
  if (filterIndex[0] === -1) return false
  let i = filterIndex.length

  while (i) {
    i--
    if (filterIndex[i] + filterSize[i] <= inputSize[i]) {
      return true
    }
  }

  return false
}

export const mapMatrix = (matrix, subrangeSize, step, callback) => {
  const matrixSize = math.size(matrix)

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
