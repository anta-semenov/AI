import math from 'mathjs'
import {mapMatrix} from '../utils/mapMatrix'

export const getDistance = (input, weigths) => weigths.reduce((res, weight, index) => {
  return res + Math.abs(weight - input[index])
}, 0)

export const kohonen = (input, filters) => {
  const flatInput = math.flatten(input)
  let minValue
  let minFilterIndex

  filters.forEach((filter, filterIndex) => {
    const flatFilter = math.flatten(filter)
    if (flatFilter.length !== flatInput.length) {
      throw Error('Kohonen: Filter and Input have different size')
    }

    const distance = getDistance(flatInput, flatFilter)

    if (!minValue || minValue > distance) {
      minValue = distance
      minFilterIndex = filterIndex
    }
  })

  return minFilterIndex
}

export const kohonenConvolutionLayer = (input, filters, step) => {
  const inputSize = math.size(input)
  const filterSize = math.size(filters[0])

  if (filterSize.length !== inputSize.length) {
    // console.log('filters', filters);
    console.log('filterSize', filterSize);
    console.log('input', inputSize);
    throw new Error('Filter and input dimensions are not the same')
  }

  return mapMatrix(input, filterSize, step, subrange => kohonen(subrange, filters))
}

export const kohonenNet = (input, layers, convertOutput) => {
  let output = input
  layers.forEach(layer => {
    output = kohonenConvolutionLayer(output, layer.filters, layer.step)
  })

  if (convertOutput) {
    const lastLayerFiltersCount = layers[layers.length - 1].filters.length
    return Array.apply(null, { length: lastLayerFiltersCount }).map((_, index) => output[0] === index ? 1 : 0)
  } else {
    return output
  }
}
