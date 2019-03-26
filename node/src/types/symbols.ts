export enum Instrument {
  AUD = 'AUD',
  EUR = 'EUR',
  GBP = 'GBP',
  CHF = 'CHF',
  CAD = 'CAD',
  JPY = 'JPY',
  Brent = 'Brent',
  Gold = 'Gold',
  Silver = 'Silver',
  Platinum = 'Platinum',
  Gas = 'Gas',
}

export namespace Instrument {
  export const all: Instrument[] = Object.values(Instrument).filter((v) => typeof v === 'string')
}
