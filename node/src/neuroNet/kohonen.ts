const math = require('mathjs')
import { mapMatrix } from '../utils/mapMatrix'
import { KohonenConvolutionLayerWeights } from '../types'

export const getDistance = (input: number[], weigths: number[]): number => weigths.reduce((res, weight, index) => {
  return res + Math.abs(weight - input[index])
}, 0)

export const kohonen = (input: Array<number | number[]>, filters: Array<number[] | number[][]>): number => {
  const flatInput = math.flatten(input)
  let minValue: number
  let minFilterIndex = -1001

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

  if (minFilterIndex === -1001) {
    throw Error('kohonen: couldn\'t find closest class')
  }

  return minFilterIndex
}

export const kohonenConvolutionLayer = (input: Array<number | number[]>, filters: Array<number[] | number[][]>, step: number): Array<number | number[]> => {
  const inputSize = math.size(input)
  const filterSize = math.size(filters[0])

  if (filterSize.length !== inputSize.length) {
    // console.log('filters', filters);
    console.log('filterSize', filterSize)
    console.log('input', inputSize)
    throw new Error('Filter and input dimensions are not the same')
  }

  return mapMatrix(input, filterSize, step, (subrange) => kohonen(subrange, filters))
}

export const kohonenNet = (input: Array<number | number[]>, layers: KohonenConvolutionLayerWeights[]): number[] => {
  let output = input
  layers.forEach((layer) => {
    output = kohonenConvolutionLayer(output, layer.filters, layer.step)
  })

  if (Array.isArray(output[0])) {
    throw Error('kohonenNet: wrong output of the last layer')
  }

  return output as number[]
}

export const converKohonenClass = (resultClass: number, numberOfClasses: number): Array<1 | 0> => {
  if (resultClass >= numberOfClasses) {
    throw Error('kohonen result class is higher then possible')
  }
  return Array.apply(null, { length: numberOfClasses }).map((_: number, index: number) => resultClass === index ? 1 : 0)
}
