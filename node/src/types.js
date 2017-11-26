type ConvolutionLayer = {
  type: 'convolution',
  size: number[]
}

type FullConnectedLayer = {
  type: 'fullConnected',
  size: number
}

export type NetSchema = {
  layers: Array<ConvolutionLayer | FullConnectedLayer>,
  numberOfSymbols: number,
  weigthsDNA?: number[]
}
