import {combineDNA} from '../evolutionStrategy'

describe('Evolution startegy', () => {
  describe('Combine DNA', () => {
    it('Should combine DNA correctly', () => {
      const generation = [
        [1, 2, 4, 5],
        [6, 7, 8, 9]
      ]

      const entitiesScores = [0.7, 0.3]

      const expectedDNA = [2.5, 3.5, 5.2, 6.2]

      expect(combineDNA(generation, entitiesScores)).toEqual(expectedDNA)
    })
  })
})
