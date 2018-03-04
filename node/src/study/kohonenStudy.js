import math from 'mathjs'
import {randomInt} from './utils'
import {kohonen, getDistance, kohonenNet, kohonenConvolutionLayer} from '../neuroNet/kohonen'
import {subrange} from '../utils/subrange'
import {increaseIndex} from '../utils/increaseIndex'
import {mapMatrix} from '../utils/mapMatrix'


const correctWeights = (input, weights, h) => weights.map((weight, index) =>
  weight + h * (input[index] - weight)
)

const h = (iteration, distanceFromWinner) => {
  const alpha = 1 / Math.pow(iteration, 0.07)
  const sigma = 1.6 / Math.pow(iteration, 0.3)

  return alpha * Math.exp(-1 * Math.pow(distanceFromWinner, 2) / (3 * sigma * sigma))
}

export const kohonenStudyIteration = (iteration, input, filters) => {
  const winner = kohonen(input, filters)
  const error = getDistance(input, filters[winner])
  const newFilters = filters.map((filter, index) => correctWeights(input, filter, h(iteration + 1, winner - index)))

  return ({error, filters: newFilters})
}

export const kohonenStudy = ({data, numberOfFilters, error, maxIterations}) => {
  // Init filters
  const startFilterInitIndex = randomInt(0, data.length * 0.7)
  const filterSize = math.size(data[0])
  const size = math.flatten(data[0]).length
  let filters = (new Array(numberOfFilters)).fill(0).map((_, index) => {
    const randomDataIndex = startFilterInitIndex + Math.trunc(index * size * 3)
    return math.flatten(data[randomDataIndex])
  })

  let currentMaxIteration = maxIterations
  if (!error && !maxIterations) {
    currentMaxIteration = 1500
  }

  // Run iterations cycle
  let iteration = 0
  const dataAmount = data.length
  while (true) {
    const dataIndex = randomInt(0, dataAmount)
    const iterationResult = kohonenStudyIteration(iteration, math.flatten(data[dataIndex]), filters)
    iteration++
    filters = iterationResult.filters

    if ((currentMaxIteration && iteration >= currentMaxIteration) || iterationResult.error < error) {
      break
    }
  }

  return math.reshape(filters, [numberOfFilters, ...filterSize])
}

export const kohonenNetStudy = (data, layers) => {
  const resultLayers = []
  let processedData = data

  layers.forEach(({type, size, step}, index) => {
    if (type !== 'kohonen') {
      return
    }
    console.log('-------------')
    console.log(`kohonen layer: ${index}, ${size}`)
    const filterSize = size.slice(1)

    const learnData = prepareLearnData(processedData, filterSize, step)
    const layerFilters = kohonenStudy({data: learnData, numberOfFilters: size[0]})
    resultLayers.push({
      filters: layerFilters,
      step
    })
    console.log(`filters: ${layerFilters}`)

    processedData = processedData.map(dataItem => kohonenConvolutionLayer(dataItem, layerFilters, step))
  })

  return resultLayers
}

export const prepareLearnData = (input, filterSize, step) => {
  if (math.size(input).length === filterSize.length + 1) {
    const result = []
    input.forEach(inputItem => {
      const newInput = mapMatrix(inputItem, filterSize, step, subrange => subrange)
      result.push(...newInput)
    })
    return result
  } else {
    return mapMatrix(input, filterSize, step, subrange => subrange)
  }
}
