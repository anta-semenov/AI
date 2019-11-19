import { load, save } from './utils/file'
import { INPUT_DEEP } from './constants'
import { mapMatrix } from './utils/mapMatrix'
import { kohonenNetStudy, kohonenStudy } from './study/kohonenStudy'
import { normalize, flattenArray } from './utils/standard'
import { Instrument, InstrumentSeparateData, KeyedDictionary, ExtremumPeriod, LayerType, KohonenConvolutionLayerWeights, NetSpecs, NetWeights, NetworkType } from './types'
import { kohonenNet } from './neuroNet/kohonen'

// кохонен можно обучить на случайных данных
// т.е. надо просто всю дату слить в одно, можно сделать массив из разных инпутов по инструментам
const data = load('data') as InstrumentSeparateData
const learnData: KeyedDictionary<ExtremumPeriod, number[][][]> = {}
ExtremumPeriod.all.forEach((period) => {
  learnData[period] = []
  Instrument.all.forEach((instrument) => {
    const symbolData = data.LearnData[instrument]!.map(({ open, close, high, low, extremumData, date }) => {
      const { min, max } = extremumData[period]
      if (close < min || low < min || open < min) {
        console.log('123', new Date(date), close, low, min)
      }
      return [
        normalize(open, min, max),
        normalize(high, min, max),
        normalize(low, min, max),
        normalize(close, min, max),
      ]
    })
    learnData[period]!.push(...mapMatrix(symbolData, [INPUT_DEEP, 4], 1, (subrange) => subrange.reverse() as number[][]) as number[][][])
  })
})

// {
//   type: 'kohonen',
//   size: [6, 4, 4],
//   step: 2
// },
// {
//   type: 'kohonen',
//   size: [10, 4],
//   step: 2
// },
// {
//   type: 'kohonen',
//   size: [15, 4],
//   step: 2
// }

const netSpecs: NetSpecs = {
  convolutionLayers: [
    {
      type: LayerType.ConvolutionKohonen,
      size: [8, 4, 4],
      step: 2,
    },
    {
      type: LayerType.ConvolutionKohonen,
      size: [10, 4],
      step: 2,
    },
    {
      type: LayerType.ConvolutionKohonen,
      size: [13, 4],
      step: 2,
    },
  ],
  // unionLayer: {
  //   type: LayerType.UnionKohonen,
  //   size: 30,
  // },
}

const convolutionWeights: KeyedDictionary<ExtremumPeriod, KohonenConvolutionLayerWeights[]> = {}
ExtremumPeriod.all.forEach((period) => {
  convolutionWeights[period] = kohonenNetStudy(learnData[period]!, netSpecs.convolutionLayers)
})

if (!netSpecs.unionLayer) {
  const netWeights: NetWeights = {
    type: NetworkType.ConvolutionOnly,
    extremumLayersSpecs: netSpecs.convolutionLayers,
    extremumLayersWeights: convolutionWeights as Record<ExtremumPeriod, KohonenConvolutionLayerWeights[]>,
  }

  save('kohonenNetWeights', netWeights)
} else {
  const unionLearnData = learnData.Absolute!.map((_, index) => {
    const inputResult = ExtremumPeriod.all.map((period) => {
      return kohonenNet(learnData[period]![index], convolutionWeights[period]!)
    })
    return flattenArray(inputResult)
  })


  const unionWeights = kohonenStudy({ data: unionLearnData, numberOfFilters: netSpecs.unionLayer!.size }) as number[][]

  const netWeights: NetWeights = {
    type: NetworkType.Union,
    extremumLayersSpecs: netSpecs.convolutionLayers,
    extremumLayersWeights: convolutionWeights as Record<ExtremumPeriod, KohonenConvolutionLayerWeights[]>,
    unionLayerSpecs: netSpecs.unionLayer!,
    unionLayerWeights: {
      type: LayerType.UnionKohonen,
      filters: unionWeights,
    },
  }

  save('kohonenNetWeights', netWeights)
}
