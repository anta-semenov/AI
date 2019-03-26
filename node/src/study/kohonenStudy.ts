import * as math from 'mathjs'
import { randomInt } from './utils'
import { kohonen, getDistance, kohonenConvolutionLayer } from '../neuroNet/kohonen'
import { mapMatrix } from '../utils/mapMatrix'
import { KohonenConvolutionLayerSpecs, LayerType, KohonenConvolutionLayerWeights } from '../types'


const correctWeights = (input: number[], weights: number[], h: number) => weights.map((weight, index) => {
  return weight + h * (input[index] - weight)
})

const h = (iteration: number, distanceFromWinner: number): number => {
  const alpha = 1 / Math.pow(iteration, 0.07)
  const sigma = 1.6 / Math.pow(iteration, 0.3)

  return alpha * Math.exp(-1 * Math.pow(distanceFromWinner, 2) / (3 * sigma * sigma))
}

export const kohonenStudyIteration = (iteration: number, input: number[], filters: number[][]) => {
  const winner = kohonen(input, filters)
  const error = getDistance(input, filters[winner])
  const newFilters = filters.map((filter, index) => correctWeights(input, filter, h(iteration + 1, winner - index)))

  return ({ error, filters: newFilters })
}

interface KohonenStudyParams {
  data: Array<number[] | number[][]>
  numberOfFilters: number,
  error?: number
  maxIterations?: number
}

export const kohonenStudy = ({ data, numberOfFilters, error, maxIterations }: KohonenStudyParams) => {
  // Init filters
  const startFilterInitIndex = randomInt(0, data.length * 0.7)
  const filterSize = math.size(data[0]) as number[]
  const size = (math.flatten(data[0]) as number[]).length
  let filters = (new Array(numberOfFilters)).fill(0).map((_, index) => {
    const randomDataIndex = startFilterInitIndex + Math.trunc(index * size * 3)
    return math.flatten(data[randomDataIndex]) as number[]
  })

  let currentMaxIteration = maxIterations
  if (!error && !maxIterations) {
    currentMaxIteration = 1500
  }

  // Run iterations cycle
  let iteration = 0
  const dataAmount = data.length
  let shouldStudy = true
  while (shouldStudy) {
    const dataIndex = randomInt(0, dataAmount)
    const iterationResult = kohonenStudyIteration(iteration, math.flatten(data[dataIndex]) as number[], filters)
    iteration++
    filters = iterationResult.filters

    if ((currentMaxIteration && iteration >= currentMaxIteration) || (!!error && iterationResult.error < error)) {
      shouldStudy = false
    }
  }

  return math.reshape(filters, [numberOfFilters, ...filterSize]) as Array<number[] | number[][]>
}

export const kohonenNetStudy = (data: number[][][], layers: KohonenConvolutionLayerSpecs[]) => {
  const resultLayers: KohonenConvolutionLayerWeights[] = []
  let processedData: Array<number[] | number[][]> = data

  layers.forEach(({ type, size, step }, index) => {
    if (type !== LayerType.ConvolutionKohonen) {
      return
    }
    console.log('-------------')
    console.log(`kohonen layer: ${index}, ${size}`)
    const filterSize = size.slice(1)

    const learnData = prepareLearnData(processedData, filterSize, step) as Array<number[] | number[][]>
    const layerFilters = kohonenStudy({ data: learnData, numberOfFilters: size[0] })
    resultLayers.push({
      filters: layerFilters,
      step,
      type,
    })
    console.log(`filters: ${layerFilters}`)

    processedData = processedData.map((dataItem) => kohonenConvolutionLayer(dataItem, layerFilters, step) as number[] | number[][])
  })

  return resultLayers
}

export const prepareLearnData = (input: Array<number[] | number[][]>, filterSize: number[], step: number) => {
  if ((math.size(input as any) as number[]).length === filterSize.length + 1) {
    const result: Array<number[] | number[][]> = []
    input.forEach((inputItem) => {
      const newInput = mapMatrix(inputItem, filterSize, step, (subrange: any) => subrange) as Array<number[] | number[][]>
      result.push(...newInput)
    })
    return result
  } else {
    return mapMatrix(input, filterSize, step, (subrange: any) => subrange)
  }
}
