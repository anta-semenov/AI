import math from 'mathjs'
import {subrange} from '../utils/subrange'
import {increaseIndex} from '../utils/increaseIndex'

export const convolutionLayer = (input, filters, step) => {
  const inputSize = math.size(input)
  const filterSize = math.size(filters[0])

  if (filterSize.length !== inputSize.length) {
    throw new Error('Filter and input dimensions are not the same')
  }

  const convolutionResult = []
  const filterResultSize = filterSize.map((filterDimensionSize, index) => (
    (inputSize[index] - filterDimensionSize) / step + 1
  ))

  const checkFilterIndex = filterIndex => {
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

  //create result matrix
  filters.forEach(filter => {
    let filterInputIndex = (new Array(filterSize.length)).fill(0)
    let resultIndex = (new Array(filterResultSize.length)).fill(0)
    const flattenFilter = math.flatten(filter)

    let filterResult = math.zeros(filterResultSize)

    while (checkFilterIndex(filterInputIndex)) {
      const endIndex = filterInputIndex.map((dimensionIndex, index) => dimensionIndex + filterSize[index] - 1)
      const subinput = math.flatten(subrange(input, filterInputIndex, endIndex))
      const dot = math.dot(flattenFilter, subinput)

      filterResult = math.subset(filterResult, math.index(...resultIndex), dot, 0)

      filterInputIndex = increaseIndex(filterInputIndex, inputSize, step, filterSize)
      resultIndex = increaseIndex(resultIndex, filterResultSize, 1)
    }

    convolutionResult.push(math.squeeze(filterResult))
  })

  return convolutionResult
}
