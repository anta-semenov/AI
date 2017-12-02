import math from 'mathjs'
import {randomInt} from './utils'
import {kohonen, getDistance} from '../neuroNet/kohonen'


const correctWeights = (input, weights, h) => wieghts.map((weight, index) =>
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
  const filters filters.map((filter, index) => correctWeights(input, filter. h(iteration, winner - index)))

  return ({error, filters})
}

export const kohonenStudy = ({data, numberOfFilters, error, maxIterations}) => {
  // Init filters
  const startFilterInitIndex = randomInt(0, data.length * 0.7)
  const filterSize = math.size(data[0])
  const size = math.flatten(data[0]).length
  let filters = (new Array(numberOfFilters)).fill(0).map((_, index) => {
    math.flatten(data[startFilterInitIndex + Math.trunc(index * size * 0.7)])
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

  return math.reshape(filters, filterSize)
}
