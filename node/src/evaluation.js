import {load} from './utils/file'
import fs from 'fs'
import {symbols} from './constants'
import {INPUT_DEEP} from './constants'

const leverage = 20

const getDealResult = (amount, startPrice, closePrice, isSell = false) => {
  if (isSell) {
    return (amount * leverage) * (1 - closePrice / startPrice)
  } else {
    return (amount * leverage) * (closePrice / startPrice - 1)
  }
}

const getDealAmount = (deposit, avgVol, startPrice, numberOfDeals) => {
  const maxAmount = deposit / numberOfDeals
  const volAmount = deposit * 0.1 * startPrice / (avgVol * 1.2) / leverage
  return Math.min(maxAmount, volAmount)
}

export const evaluateModel = () => {
  const predictions = JSON.parse(fs.readFileSync('../predictions.json'))
  const dayData = load('perDateData').testData.slice(INPUT_DEEP + 1, )

  if ((predictions.length + 1) !== dayData.length) {
    throw Error(`dayData and predictions lengths aren\'t equal ${predictions.length}, ${dayData.length}`)
  }

  const startDeposit = 1000
  let deposit = startDeposit
  let totalDeals = 0
  let winDeals = 0
  let loseDeals = 0

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
        totalDeals++
        const stopPrice = symbolDayData.open - symbolDayData.avgVol * 1.2
        const closePrice = stopPrice < symbolDayData.low ? symbolDayData.close : stopPrice
        const amount = getDealAmount(dayDeposit, symbolDayData.avgVol, symbolDayData.open, numberOfDeals)
        const result = getDealResult(amount, symbolDayData.open, closePrice)
        result > 0 ? loseDeals++ : winDeals++
        deposit += result
      } else if (isSell) {
        totalDeals++
        const stopPrice = symbolDayData.open + symbolDayData.avgVol * 1.2
        const closePrice = stopPrice > symbolDayData.high ? symbolDayData.close : stopPrice
        const amount = getDealAmount(dayDeposit, symbolDayData.avgVol, symbolDayData.open, numberOfDeals)
        const result = getDealResult(amount, symbolDayData.open, closePrice, true)
        result > 0 ? loseDeals++ : winDeals++
        deposit += result
      }
    })
  })

  console.log('End of evaluation')
  console.log(`depo: ${deposit}, %: ${deposit / startDeposit * 100}`)
  console.log(`total: ${totalDeals}, win: ${winDeals}, lose: ${loseDeals}`);
}

evaluateModel()
