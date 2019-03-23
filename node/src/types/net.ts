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

export interface KohonenUnionLayerWeights extends LayerBase<LayerType.UnionKohonen> {
  filters: number[][]
}

export enum NetworkType {
  ConvolutionOnly = 'ConvolutionOnly',
  Union = 'Union',
}

interface NetWeightsBase <T extends NetworkType> {
  type: T
}

interface ConvolutionNetWeights extends NetWeightsBase<NetworkType.ConvolutionOnly> {
  extremumLayersSpecs: KohonenConvolutionLayerSpecs[]
  extremumLayersWeights: Record<ExtremumPeriod, KohonenConvolutionLayerWeights[]>
}

interface UnionNetWeights extends NetWeightsBase<NetworkType.Union> {
  extremumLayersSpecs: KohonenConvolutionLayerSpecs[]
  extremumLayersWeights: Record<ExtremumPeriod, KohonenConvolutionLayerWeights[]>
  unionLayerWeights: KohonenUnionLayerWeights
  unionLayerSpecs: KohonenUnionLayerSpecs
}

export type NetWeights = ConvolutionNetWeights | UnionNetWeights
