import {convolutionLayerCreator} from './convolutionNeuron'
import {fullConnectedLayerCreator} from './fullConnected'

type ConvolutionLayer = {
  type: 'convolution',
  size: number[],
  step: number
}

type FullConnectedLayer = {
  type: 'fullConnected',
  size: number
}

type NetSchema = {
  layers: Array<ConvolutionLayer | FullConnectedLayer>,
  numberOfSymbols: number,
  weigthsDNA?: number[]
}

export const getLayerOutputSize = (layer: ConvolutionLayer | FullConnectedLayer, numberOfSymbols: number) => {
  if (layer.type === 'fullConnected') {
    return layer.size
  } else {
    return layer.size[0] * numberOfSymbols * 2
  }
}

export const netCreator = ({layers, numberOfSymbols, weigthsDNA}: NetSchema) => {
  let dnaIndex = 0
  const convolutionLayers = []
  const fullConnectedLayers = []
  layers.forEach((layer, index) => {
    if (layer.type === 'convolution') {
      const creatorResult = convolutionLayerCreator(dnaIndex, weigthsDNA, layer.size, layer.step)
      convolutionLayers.push(creatorResult.layer)
      dnaIndex = creatorResult.dnaIndex
    }

    if (layer.type === 'fullConnected') {
      const creatorResult = fullConnectedLayerCreator(
        dnaIndex,
        weigthsDNA,
        layer.size,
        getLayerOutputSize(layers[index - 1], numberOfSymbols)
      )
      fullConnectedLayers.push(creatorResult.layer)
      dnaIndex = creatorResult.dnaIndex
    }
  })
  const net = (input: number[][][]) => {
    let output = []
    input.forEach(instrumentInput => {
      let layerOutput = instrumentInput
      convolutionLayers.forEach(layer => {
        layerOutput = layer.calculate(layerOutput)
      })
      output = [...output, ...layerOutput]
    })

    fullConnectedLayers.forEach(layer => {
      output = layer.calculate(output)
    })

    return output
  }

  return ({
    net
  })
}
