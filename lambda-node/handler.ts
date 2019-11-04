import * as AWS from 'aws-sdk'
import { Callback } from 'aws-lambda'
import { kohonenNet, converKohonenClass, kohonen } from '../node/src/neuroNet/kohonen'
import * as dateFns from 'date-fns'
import { Instrument, ExtremumPeriod, InstrumentDayData, ExtremumData, KeyedDictionary, NetWeights, NetworkType, SymbolData } from '../node/src/types'
import { mapKeysAndValues, mapValues, flattenArray } from '../node/src/utils/standard'

// const symbols = ['AUD', 'EUR', 'GBP', 'CHF', 'CAD', 'JPY', 'Brent', 'Gold', 'Wheat', 'Soybean', 'XOM']
const INPUT_DEEP = 22

interface Price {
  open: number
  close: number
  high: number
  low: number
  date: number
}

const fxProSymbolMap: Record<Instrument, string> = {
  AUD: 'AUDUSD',
  EUR: 'EURUSD',
  GBP: 'GBPUSD',
  CHF: 'USDCHF',
  CAD: 'USDCAD',
  JPY: 'USDJPY',
  Brent: 'BRENT',
  Gold: 'GOLD',
  Silver: 'SILVER',
  Platinum: 'PLATINUM',
  Gas: 'NAT.GAS',
}

interface InputPayload {
  [symbol: string]: Price
}

enum Deal {
  nothing = 'nothing',
  buy = 'buy',
  sell = 'sell',
}

interface SymbolResult {
  deal: Deal
  sl?: number
  numberOfDeals?: number
}

function getS3Data(bucket: string, key: string): Promise<any> {
  const s3 = new AWS.S3()
  return s3.getObject({ Bucket: bucket, Key: key })
    .promise()
    .then((data) => JSON.parse(data.Body))
}

function putS3Data(bucket: string, key: string, object: any): Promise<void> {
  const s3 = new AWS.S3()
  return s3.putObject({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(object),
  })
    .promise()
    .then(() => {})
}

function normalize(value: number, min: number, max: number): number {
  return (value - min) / (max - min)
}

export async function predict(event: any, _: any, callback: Callback) {
  const body: InputPayload = JSON.parse((event.body as string).replace('\u0000', ''))
  console.log('Payload body: ', body)
  let symbolDataName = 'symbolsData.json'
  if (typeof body.symbolDataPrefix === 'string') {
    symbolDataName = `${body.symbolDataPrefix}_${symbolDataName}`
  }
  const symbolsData = await getS3Data('antonsemenov-ai-files', symbolDataName) as KeyedDictionary<Instrument, SymbolData>
  const symbolsWithoutFreshData: Instrument[] = []
  Instrument.all.forEach((symbol) => {
    if (!symbolsData[symbol]) {
      throw Error(`Don't have instrument ${symbol} in symbolsData.json`)
    }
    const symbolData = symbolsData[symbol]!
    if (!symbolData.extremumStorage || !symbolData.dayData[0].extremumData) {
      throw Error(`Old format of symbolsData.json`)
    }
    const input = body[fxProSymbolMap[symbol]]
    const inputDate = dateFns.parse(input.date).getTime()

    console.log(`Process ${symbol}: symbol last date - ${symbolData.lastDate}, input date - ${inputDate}, iput data - ${input}`)

    if (Number(symbolData.lastDate) < inputDate) {
      symbolData.lastDate = inputDate

      symbolData.extremumStorage = mapKeysAndValues(
        symbolData.extremumStorage,
        (period: ExtremumPeriod, storage) => ExtremumPeriod.updateExtremumData({ max: input.high, min: input.low }, period, storage!),
      )
      symbolData.volatility = [Math.abs(input.high - input.low), ...symbolData.volatility.slice(0, INPUT_DEEP - 1)]

      const dataForSet: InstrumentDayData = ({
        date: inputDate,
        open: input.open,
        close: input.close,
        high: input.high,
        low: input.low,
        extremumData: mapValues(symbolData.extremumStorage, (storage) => ExtremumPeriod.getExtremumData(storage!)) as Record<ExtremumPeriod, ExtremumData>,
        avgVol: Math.trunc(symbolData.volatility.reduce((res, item) => res + item, 0) * 100000 / symbolData.volatility.length) / 100000,
      })

      symbolData.dayData = [dataForSet, ...symbolData.dayData.slice(0, INPUT_DEEP - 1)]
    } else {
      symbolsWithoutFreshData.push(symbol)
    }
  })

  if (symbolsWithoutFreshData.length > 0 && symbolsWithoutFreshData.length < Instrument.all.length) {
    try {
      sendErrorEmail({ body: `Instruments with missing data: ${symbolsWithoutFreshData.join(', ')}` }, null, () => {})
    } catch {
      //
    }
  }

  await putS3Data('antonsemenov-ai-files', 'symbolsData.json', symbolsData)

  // prepare kohonen output
  const kohonenNetWeights = await getS3Data('antonsemenov-ai-files', 'kohonenNetWeights.json') as NetWeights
  let kohonenResult: number[] = []

  Instrument.all.forEach((instrument) => {
    const symbolData = symbolsData[instrument]!
    if (symbolData.dayData.length !== INPUT_DEEP) {
      callback(Error(`Day data size of ${instrument} not equal input size`), null)
    }

    const convolutionKohonenResult = flattenArray(Object.keys(kohonenNetWeights.extremumLayersWeights).map((period: ExtremumPeriod) => {
      const kohonenInputData = symbolData.dayData.map(({ open, close, high, low, extremumData }) => {
        const { min, max } = extremumData[period]
        return [
          normalize(open, min, max),
          normalize(high, min, max),
          normalize(low, min, max),
          normalize(close, min, max),
        ]
      })

      return kohonenNet(kohonenInputData, kohonenNetWeights.extremumLayersWeights[period])
    }))

    if (convolutionKohonenResult.length !== Object.keys(kohonenNetWeights.extremumLayersWeights).length) {
      throw Error('kohonen extremum net returns not plain clases')
    }

    if (kohonenNetWeights.type === NetworkType.Union) {
      const unnionKohonenClass = converKohonenClass(kohonen(convolutionKohonenResult, kohonenNetWeights.unionLayerWeights.filters), kohonenNetWeights.unionLayerSpecs.size)
      kohonenResult = [...kohonenResult, ...unnionKohonenClass]
    } else {
      const numberOfFilters = kohonenNetWeights.extremumLayersSpecs[kohonenNetWeights.extremumLayersSpecs.length - 1].size[0]
      const convertedConvolutionKohonenResult = flattenArray(convolutionKohonenResult.map((resultClass) => converKohonenClass(resultClass, numberOfFilters)))
      kohonenResult = [...kohonenResult, ...convertedConvolutionKohonenResult]
    }
  })

  // await putS3Data('antonsemenov-ai-files', 'kohonen-result.json', JSON.stringify(kohonenResult))


  // calling python
  const lambda = new AWS.Lambda()
  const params = {
    FunctionName : 'lambda-python-dev-keras',
    InvocationType : 'RequestResponse',
    Payload: JSON.stringify(kohonenResult),
  }
  const pythonResponse = await lambda.invoke(params).promise()
  if (!(pythonResponse.Payload && typeof pythonResponse.Payload === 'string')) {
    callback(Error('Wrong keras prediction'), null)
  }

  const predictions = JSON.parse(JSON.parse(pythonResponse.Payload).result) as number[]
  const numberOfDeals = predictions.reduce((res, value) => value > 0.7 ? res + 1 : res, 0)

  const result: { [symbol: string]: SymbolResult } = {}
  Instrument.all.forEach((symbol, symbolIndex) => {
    const isBuy = predictions[symbolIndex * 2] > 0.7
    const isSell = predictions[symbolIndex * 2 + 1] > 0.7

    const dayData = symbolsData[symbol]!.dayData[0]

    if (isBuy && isSell) {
      result[fxProSymbolMap[symbol]] = { deal: Deal.nothing }
    } else if (isBuy) {
      result[fxProSymbolMap[symbol]] = { deal: Deal.buy, sl: dayData.avgVol * 1.2, numberOfDeals }
    } else if (isSell) {
      result[fxProSymbolMap[symbol]] = { deal: Deal.sell, sl: dayData.avgVol * 1.2, numberOfDeals }
    } else {
      result[fxProSymbolMap[symbol]] = { deal: Deal.nothing }
    }
  })

  const response = {
    statusCode: 200,
    body: JSON.stringify(result),
  }

  callback(null, response)
}

export function sendErrorEmail(event: any, _: any, callback: Callback) {
  const text = event.body.toString()
  const ses = new AWS.SES({ region: 'us-east-1' })

  ses.sendEmail({
    Destination: {
      ToAddresses: ['anta.semenov@gmail.com'],
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: text,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Error in AI expert',
      },
    },
    Source: 'anta.semenov@icloud.com',
  }, (err) => {
    if (err) {
      console.log(err)
    }
    callback(null, { statusCode: 200 })
  })
}
