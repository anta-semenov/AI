export const outputHandlerCreator = symbols => {
  let score = 0

  const tradeStatus = {}
  symbols.forEach(symbol => {
    tradeStatus[symbol] = {status: 0, openPrice: 0}
  })

  const handleOutput = (output, priceData) => {
    symbols.forEach((symbol, index) => {
      const symbolPrice = priceData[symbol]
      const buySignal = output[2 * index] > 0.8 ? 1 : 0
      const sellSignal = output[2 * index + 1] > 0.8 ? 1 : 0
      const symbolTradeStatus = tradeStatus[symbol]

      const loseBuySignal = symbolTradeStatus.status === 1 && !buySignal
      const loseSellSignal = symbolTradeStatus.status === -1 && !sellSignal
      const bothActiveUnactive = symbolTradeStatus.status !== 0 && ((buySignal && sellSignal) || (!buySignal && !sellSignal))

      if (loseBuySignal || loseSellSignal || bothActiveUnactive) {
        score += (symbolPrice - symbolTradeStatus.openPrice) * symbolTradeStatus.status / (symbolTradeStatus.status > 0 ? symbolTradeStatus.openPrice : symbolPrice)
        tradeStatus[symbol].status = 0
      }

      if (symbolTradeStatus.status === 0 && buySignal && !sellSignal) {
        tradeStatus[symbol] = {
          status: 1,
          openPrice: symbolPrice
        }
      }

      if (symbolTradeStatus.status === 0 && !buySignal && sellSignal) {
        tradeStatus[symbol] = {
          status: -1,
          openPrice: symbolPrice
        }
      }
    })
  }

  return ({
    handle: handleOutput,
    getScore: () => score,
    getSymbolTradeStatus: symbol => tradeStatus[symbol].status
  })
}
