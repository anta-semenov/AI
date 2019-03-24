import {getLayerOutputSize} from '../neuroNet/net'

const random = (start = 0, end = 1) => Math.random() * end + start
export const randomInt = (start = 0, end = 10) => Math.trunc(Math.random() * end) + start

export const createDNA  = ({layers, numberOfSymbols}) => {
  const dna = []
  let dnaIndex = 0
  layers.forEach((layer, index) => {
    if (layer.type === 'convolution') {
      const size = layer.size.reduce((result, item) => result * item, 1)
      const endIndex = dnaIndex + size
      while (dnaIndex < endIndex) {
        dna[dnaIndex] = randomInt(0, 3)
        dnaIndex++
      }
    }

    if (layer.type === 'fullConnected') {
      const inputSize = getLayerOutputSize(layers[index - 1], numberOfSymbols)
      const endIndex = dnaIndex + layer.size * inputSize
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

export const noiseArray = (array, noisePercent) => {
  return array.map(item => {
    if (Math.trunc(item) === item) {
      return randomInt(item * (1 - noisePercent), item * (1 + noisePercent))
    }

    return random(item * (1 - noisePercent), item * (1 + noisePercent))
  })
}
