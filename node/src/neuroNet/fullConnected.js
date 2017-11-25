import math from 'mathjs'

export const fullConnectedLayer = (input: number[], outNeurons: numer[][], transferFunction: (value: number) => number): number => {
  return outNeurons.map(neuronWeigths => transferFunction(math.dot(input, neuronWeigths)))
}

const transferFunctionCreator = t => input => 1 / (1 + Math.exp(-1 * t * input))

export const fullConnectedLayerCreator = (dnaIndex: number, dna: number[], outSize, inputSize) => {
  const weigthsAmount = outSize * inputSize
  const weigths = dna.slice(dnaIndex + 1, dnaIndex + 1 + weigthsAmount)
  const outNeurons = math.reshape(weigths, [outSize, inputSize])
  const t = dna[dnaIndex + 1 + weigthsAmount]
  const layer = input => fullConnectedLayer(input, outNeurons, transferFunctionCreator(t))

  return ({
    layer: {calculate: layer},
    dnaIndex: dnaIndex + 1 + weigthsAmount
  })
}
