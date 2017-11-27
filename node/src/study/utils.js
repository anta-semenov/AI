import {getLayerOutputSize} from '../neuroNet/net'

const random = (start: number = 0, end: number = 1) => Math.random() * end + start
const randomInt = (start: number = 0, end: number = 10) => Math.trunc(Math.random() * end) + start

export const createDNA  = ({layers, numberOfSymbols}) => () => {
  const dna = []
  let dnaIndex = 0
  layers.forEach((layer, index) => {
    if (layer.type === 'convolution') {
      const size = layersize.reduce((result, item) => result * item, 1)
      const endIndex = dnaIndex + size
      while (dnaIndex < endIndex) {
        dna[dnaIndex] = randomInt(0, 30)
        dnaIndex++
      }
    }

    if (layer.type === 'fullConnected') {
      const endIndex = dnaIndex + size
      const inputSize = getLayerOutputSize(layers[index - 1], numberOfSymbols)
      while (dnaIndex <= endIndex) {
        if (dnaIndex === endIndex) {
          // it's a t parameter
          dna[dnaIndex] = random(0.5, 5)
        } else {
          dna[dnaIndex] = random(1 / (2.5 * inputSize), 1 / (0.5 * inputSize))
        }
        dnaIndex++
      }
    }
  })

  return dna
}

export const noiseArray = (array: number[], noisePercent: number): number[] => {
  return array.map(item => {
    if (Math.trunc(item) === item) {
      return randomInt(item * (1 - noisePercent), item * (1 + noisePercent))
    }

    return random(item * (1 - noisePercent), item * (1 + noisePercent))
  })
}
