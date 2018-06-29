import {load} from './utils/file'
import fs from 'fs'
import {symbols} from './constants'

const getDealResult = (amount, startPrice, closePrice, isSell = false) => {
  if (isSell) {
    return amount * (1 - closePrice / startPrice)
  } else {
    return amount * (closePrice / startPrice - 1)
  }
}

const getDealAmount = (deposit, avgVol, startPrice, numberOfDeals) => {
  const maxAmount = deposit / numberOfDeals
  const volAmount = deposit * 0.1 * startPrice / (avgVol * 1.5)
  return Math.min(maxAmount, volAmount)
}

export const evaluateModel = () => {
  const predictions = JSON.parse(fs.readFileSync('./predictions.json'))
  const dayData = load('perDateData').testData

  if (predictions.length !== dayData.length) {
    throw Error('dayData and predictions lengths aren\'t equal')
  }

  const startDeposit = 1000
  let deposit = startDeposit

  predictions.forEach((predict, predictIndex) => {
    const numberOfDeals = predict.reduce((res, value) => value > 0.7 ? res + 1 : res, 0)
    const dayDeposit = deposit

    symbols.forEach((symbol, symbolIndex) => {
      const symbolDayData = dayData[predictIndex][symbol]

      const isBuy = predict[symbolIndex * 2] > 0.7
      const isSell = predict[symbolIndex * 2 + 1] > 0.7

      if (isBuy && isSell) {
        return
      } else if (isBuy) {
        const stopPrice = symbolDayData.open - symbolDayData.avgVol * 1.5
        const closePrice = stopPrice < symbolDayData.low ? symbolDayData.close : symbolDayData.low
        const amount = getDealAmount(dayDeposit, symbolDayData.avgVol, symbolDayData.open, numberOfDeals)
        deposit += getDealResult(amount, symbolDayData.open, closePrice)
      } else if (isSell) {
        const stopPrice = symbolDayData.open + symbolDayData.avgVol * 1.5
        const closePrice = stopPrice > symbolDayData.high ? symbolDayData.close : symbolDayData.high
        const amount = getDealAmount(dayDeposit, symbolDayData.avgVol, symbolDayData.open, numberOfDeals)
        deposit += getDealResult(amount, symbolDayData.open, closePrice, true)
      }
    })
  })
}
