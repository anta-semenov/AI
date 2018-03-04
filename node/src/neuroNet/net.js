import {convolutionLayerCreator} from './convolutionNeuron'
import {fullConnectedLayerCreator} from './fullConnected'

type ConvolutionLayer = {
  type: 'convolution',
  size: number[],
  step: number
}

type KohonenLayer = {
  type: 'kohonen',
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
      const creatorResult = convolutionLayerCreator(dnaIndex, weigthsDNA, layer)
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
    console.log('====================');
    input.forEach(instrumentInput => {
      let layerOutput = instrumentInput
      convolutionLayers.forEach(layer => {
        layerOutput = layer.calculate(layerOutput)
      })
      output = [...output, ...layerOutput]
      console.log('outputs', output);
    })

    fullConnectedLayers.forEach(layer => {
      output = layer.calculate(output)
      console.log('outputs', output);
    })

    return output
  }

  return net
}
