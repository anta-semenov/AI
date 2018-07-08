export const symbols = ['AUD', 'EUR', 'GBP', 'CHF', 'CAD', 'JPY', 'Brent', 'Gold', 'Wheat', 'Soybean']
export const points = {
  AUD: 1000,
  EUR: 1000,
  GBP: 1000,
  CHF: 1000,
  CAD: 1000,
  JPY: 100000,
  Brent: 100,
  Gold: 10,
  Wheat: 100,
  Soybean: 100,
  XOM: 100,
}

export const INPUT_DEEP = 22
export const NUMBER_OF_LOCAL_SECTORS = 15
export const NUMBER_OF_ABSOULTE_SECTORS = 15

export const urls = {
  AUD: {
    provider: 'quandl',
    id: 'CME_AD1',
    apiUrl: 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_AD1.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=2000-01-01&end_date=2018-07-05',
    processingValue: (value) => value,
  },
  EUR: {
    provider: 'quandl',
    id: 'CME_EC1',
    apiUrl: 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_EC1.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=2000-01-01&end_date=2018-07-05',
    processingValue: (value) => value,
  },
  GBP: {
    provider: 'quandl',
    id: 'CME_BP1',
    apiUrl: 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_BP1.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=2000-01-01&end_date=2018-07-05',
    processingValue: (value) => value,
  },
  CHF: {
    provider: 'quandl',
    id: 'CME_SF1',
    apiUrl: 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_SF1.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=2000-01-01&end_date=2018-07-05',
    processingValue: (value) => Math.trunc(10000 / value) / 10000,
  },
  CAD: {
    provider: 'quandl',
    id: 'CME_CD1',
    apiUrl: 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_CD1.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=2000-01-01&end_date=2018-07-05',
    processingValue: (value) => Math.trunc(10000 / value) / 10000,
  },
  JPY: {
    provider: 'quandl',
    id: 'CME_JY1',
    apiUrl: 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_JY1.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=2000-01-01&end_date=2018-07-05',
    processingValue: (value) => Math.trunc(100000000 / value) / 100,
  },
  Brent: {
    provider: 'quandl',
    id: 'ICE_B1',
    apiURL: 'https://www.quandl.com/api/v3/datasets/CHRIS/ICE_B1.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=2000-01-01&end_date=2018-07-05',
    processingValue: (value) => value,
  },
  Gold: {
    provider: 'quandl',
    id: 'CME_GC1',
    apiUrl: 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_GC1.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=2000-01-01&end_date=2018-07-05',
    processingValue: (value) => value,
  },
  Wheat: {
    provider: 'quandl',
    id: 'CME_W2',
    apiUrl: 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_W2.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=2000-01-01&end_date=2018-07-05',
    processingValue: (value) => value,
  },
  Soybean: {
    provider: 'quandl',
    id: 'CME_S2',
    apiUrl: 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_S2.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=2000-01-01&end_date=2018-07-05',
    processingValue: (value) => value,
  },
  XOM: {
    provider: 'alphavantage',
    id: 'XOM',
    processingValue: (value) => value,
  },
  Gas: {
    provider: 'quandl',
    id: 'CME_NG3',
    apiUrl: 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_NG3.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=2000-01-01&end_date=2018-07-05',
    processingValue: (value) => value,
  },
  Cocoa: {
    provider: 'quandl',
    id: 'ICE_CC2',
    apiUrl: 'https://www.quandl.com/api/v3/datasets/CHRIS/ICE_CC2.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=2000-01-01&end_date=2018-07-04',
    processingValue: (value) => value,
  },
  Coffee: {
    provider: 'quandl',
    id: 'ICE_KC2',
    apiUrl: 'https://www.quandl.com/api/v3/datasets/CHRIS/ICE_KC2.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=1999-12-31&end_date=2018-07-05',
    processingValue: (value) => value,
  },
  Corn: {
    provider: 'quandl',
    id: 'CME_C2',
    apiUrl: 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_C2.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=2000-01-01&end_date=2018-07-05',
    processingValue: (value) => value,
  },
  Cotton: {
    provider: 'quandl',
    id: 'ICE_CT6',
    apiUrl: 'https://www.quandl.com/api/v3/datasets/CHRIS/ICE_CT6.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=2000-01-01&end_date=2018-07-05',
    processingValue: (value) => value,
  },
  Sugar: {
    provider: 'quandl',
    id: 'ICE_SB1',
    apiUrl: 'https://www.quandl.com/api/v3/datasets/CHRIS/ICE_SB1.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=2000-01-01&end_date=2018-07-04',
    processingValue: (value) => value,
  },
  Silver: {
    provider: 'quandl',
    id: 'CME_SI2',
    apiUrl: 'https://www.quandl.com/api/v3/datasets/CHRIS/CME_SI2.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=2000-01-01&end_date=2018-07-05',
    processingValue: (value) => value,
  },
  DAX: {
    provider: 'quandl',
    id: 'EUREX_FDAX1',
    apiUrl: 'https://www.quandl.com/api/v3/datasets/CHRIS/EUREX_FDAX1.json?api_key=hMdg3RhBV_oi6qsDQcrv&start_date=2000-01-01&end_date=2018-07-05',
    processingValue: (value) => value,
  },

}
