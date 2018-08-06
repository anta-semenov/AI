import AWS from 'aws-sdk'
import { Callback } from 'aws-lambda'
import { kohonenNet } from '../node/src/neuroNet/kohonen'

const symbols = ['AUD', 'EUR', 'GBP', 'CHF', 'CAD', 'JPY', 'Brent', 'Gold', 'Wheat', 'Soybean', 'XOM']

interface Price {
  open: number
  close: number
  high: number
  low: number
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
  [symbol: number]: Price;
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
  last20max: number[]
  volatility: number[]
}

const getS3Data = (bucket: string, key: string): Promise<any> => {
  const s3  =new AWS.S3()
  return s3.getObject({ Bucket: bucket, Key: key })
    .promise()
    .then((data) => JSON.parse(data.Body))
}

export async function predict(event: InputPayload, _: any, callback: Callback) {
  const kohonenAbsoluteLayers = await getS3Data('antonsemenov-ai-files', 'kohonenAbsoluteLayers.json')
  const kohonenLocalLayers = await getS3Data('antonsemenov-ai-files', 'kohonenLocalLayers.json')
  const symbolsData = await getS3Data('antonsemenov-ai-files', 'symbolsData.json') as { [symbol: string]: SymbolData }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  }

  callback(null, response)
}
