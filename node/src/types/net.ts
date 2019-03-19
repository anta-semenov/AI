import { ExtremumPeriod } from './data'

export enum LayerType {
  Kohonen = 'Kohonen',
  UnionKohonen = 'UnionKohonen',
  ConvolutionKohonen = 'ConvolutionKohonen',
}

interface LayerBase<T extends LayerType> {
  type: T
}

export interface KohonenConvolutionLayerSpecs extends LayerBase<LayerType.ConvolutionKohonen> {
  size: number[]
  step: number
}

export interface KohonenUnionLayerSpecs extends LayerBase<LayerType.UnionKohonen> {
  size: number
}

export type LayerSpecs = KohonenConvolutionLayerSpecs | KohonenUnionLayerSpecs

export interface KohonenConvolutionLayerWeights extends LayerBase<LayerType.ConvolutionKohonen> {
  filters: number[][] | number[][][]
  step: number
}

export interface KohonenUnionLayeWeights extends LayerBase<LayerType.UnionKohonen> {
  filters: number[][]
}

export interface NetWeights {
  extremumLayersSpecs: KohonenUnionLayerSpecs[]
  extremumLayersWeights: Record<ExtremumPeriod, KohonenConvolutionLayerWeights[]>
  unionLayerWeights?: KohonenUnionLayeWeights
}
