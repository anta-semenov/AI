import AWS from 'aws-sdk'
import { Callback } from 'aws-lambda'
import { kohonenNet } from '../node/src/neuroNet/kohonen'
import dateFns from 'date-fns'

const symbols = ['AUD', 'EUR', 'GBP', 'CHF', 'CAD', 'JPY', 'Brent', 'Gold', 'Wheat', 'Soybean', 'XOM']
const INPUT_DEEP = 22
const DEFAULT_MIN = 999999999999

interface Price {
  open: number
  close: number
  high: number
  low: number
  date: string
}

enum Symbol {
  AUD = 'AUD',
  EUR = 'EUR',
  GBP = 'GBP',
  CHF = 'CHF',
  CAD = 'CAD',
  JPY = 'JPY',
  Brent = 'Brent',
  Gold = 'Gold',
  Wheat = 'Wheat',
  Soybean = 'Soybean',
  XOM = 'XOM',
}

interface InputPayload {
  [symbol: string]: Price;
}

interface DayData {
  date: number
  open: number
  close: number
  high: number
  low: number
  maxAbsolute: number
  minAbsolute: number
  maxLocal: number
  minLocal: number
  avgVol: number
}

interface SymbolData {
  lastDate: number
  minAbsolute: number
  maxAbsolute: number
  last20Low: number[]
  last20High: number[]
  volatility: number[]
  dayData: DayData[]
}

const getS3Data = (bucket: string, key: string): Promise<any> => {
  const s3 = new AWS.S3()
  return s3.getObject({ Bucket: bucket, Key: key })
    .promise()
    .then((data) => JSON.parse(data.Body))
}

const putS3Data = (bucket: string, key: string, object: any): Promise<void> => {
  const s3 = new AWS.S3()
  return s3.putObject({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(object),
  })
    .promise()
    .then(() => {})
}

const normalize = (value: number, min: number, max: number): number => (value - min) / (max - min)

export async function predict(event: InputPayload, _: any, callback: Callback) {
  const symbolsData = await getS3Data('antonsemenov-ai-files', 'symbolsData.json') as { [symbol: string]: SymbolData }
  Object.values(Symbol).forEach((symbol: string) => {
    const symbolData = symbolsData[symbol]
    const input = event[symbol]
    const inputDate = dateFns.startOfDay(dateFns.parse(input.date)).getTime()
    if (symbolData.lastDate < inputDate) {
      symbolData.lastDate = inputDate

      symbolData.maxAbsolute = Math.max(symbolData.maxAbsolute, input.high)
      symbolData.minAbsolute = Math.min(symbolData.minAbsolute, input.low)
      symbolData.last20Low.unshift(input.low)
      symbolData.last20High.unshift(input.high)
      symbolData.volatility.unshift(Math.abs(input.high - input.low))

      if (symbolData.last20Low.length > INPUT_DEEP) {
        symbolData.last20Low.pop()
        symbolData.last20High.pop()
        symbolData.volatility.pop()
      }

      const dataForSet = ({
        date: inputDate,
        open: input.open,
        close: input.close,
        high: input.high,
        low: input.low,
        maxAbsolute: symbolData.maxAbsolute,
        minAbsolute: symbolData.minAbsolute,
        maxLocal: symbolData.last20High.reduce((res, item) => Math.max(res, item || 0), 0),
        minLocal: symbolData.last20Low.reduce((res, item) => Math.min(res, item || DEFAULT_MIN), DEFAULT_MIN),
        avgVol: Math.trunc(symbolData.volatility.reduce((res, item) => res + item, 0) * 100000 / symbolData.volatility.length) / 100000
      })

      symbolData.dayData.unshift(dataForSet)
      if (symbolData.dayData.length > INPUT_DEEP) {
        symbolData.dayData.pop()
      }
    }
  })

  await putS3Data('antonsemenov-ai-files', 'symbolsData.json', symbolsData)

  // prepare kohonen output
  const kohonenAbsoluteLayers = await getS3Data('antonsemenov-ai-files', 'kohonenAbsoluteLayers.json')
  const kohonenLocalLayers = await getS3Data('antonsemenov-ai-files', 'kohonenLocalLayers.json')
  let kohonenResult: number[] = []

  Object.values(Symbol).forEach((symbol: string) => {
    const symbolData = symbolsData[symbol]
    if (symbolData.dayData.length !== INPUT_DEEP) {
      throw Error(`Day data size of ${symbol} not equal input size`)
    }

    const kohonenInputLocal = symbolData.dayData.map(({open, close, high, low, minLocal, maxLocal}) => {
      return [
        normalize(open, minLocal, maxLocal),
        normalize(high, minLocal, maxLocal),
        normalize(low, minLocal, maxLocal),
        normalize(close, minLocal, maxLocal),
      ]
    })
    const localTFInputs = kohonenNet(kohonenInputLocal, kohonenLocalLayers, true)

    const kohonenInputAbsolute = symbolData.dayData.map(({open, close, high, low, minAbsolute, maxAbsolute}) => {
      return [
        normalize(open, minAbsolute, maxAbsolute),
        normalize(high, minAbsolute, maxAbsolute),
        normalize(low, minAbsolute, maxAbsolute),
        normalize(close, minAbsolute, maxAbsolute),
      ]
    })
    const absoluteTFInputs = kohonenNet(kohonenInputAbsolute, kohonenAbsoluteLayers, true)

    kohonenResult = [...kohonenResult, ...localTFInputs, ...absoluteTFInputs]
  })

  await putS3Data('antonsemenov-ai-files', 'kohonen-result.json', kohonenResult)


  // calling python
  const lambda = new AWS.Lambda()
  const params = {
    FunctionName : 'lambda-python-dev-keras',
    InvocationType : 'RequestResponse',
  }
  const pythonResponse = await lambda.invoke(params).promise()
  if (!(pythonResponse.Payload && typeof pythonResponse.Payload === 'string')) {
    return Promise.reject('Invalid response from our own backend')
  }

  const predictions = JSON.parse(pythonResponse.Payload) as number[]
  const numberOfDeals = predictions.reduce((res, value) => value > 0.7 ? res + 1 : res, 0)




  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  }

  callback(null, response)
}
