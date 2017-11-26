import {sectorCreator, getSectorArray} from '../inputs'

describe('Inputs', () => {
  describe('Sector creator', () => {
    it('Should return 0 for min value', () => {
      const getSector = sectorCreator(1.25, 1.75, 10)
      expect(getSector(1.25)).toBe(0)
    })

    it('Should return numberOfSectors - 1 for max value', () => {
      const getSector = sectorCreator(1.25, 1.75, 10)
      expect(getSector(1.75)).toBe(9)
    })

    it('Should work correctly', () => {
      const getSector = sectorCreator(1.25, 1.75, 10)
      expect(getSector(1.54)).toEqual(5)
      expect(getSector(1.56)).toEqual(6)
      expect(getSector(1.27)).toEqual(0)
      expect(getSector(1.73)).toEqual(9)
    })
  })

  describe('getSectorArray', () => {
    it('Should return correct array', () => {
      expect(getSectorArray(5, 3)).toEqual([0, 0, 0, 1, 0])
    })
  })
})
