import {increaseIndex} from './increaseIndex'

describe('Increase index', () => {
  it('Should increase multidimensial index starting from last dimension', () => {
    const index = [0, 0, 0]
    const size = [3, 4, 4]
    const expectIndex = [0, 0, 1]

    expect(increaseIndex(index, size, 1)).toEqual(expectIndex)
  })

  it('Should increase next dimension and set prev dimensions to 0, when it stay bigger then size', () => {
    const index = [0, 0, 3]
    const size = [3, 4, 4]
    const expectIndex = [0, 1, 0]

    expect(increaseIndex(index, size, 1)).toEqual(expectIndex)
  })

  it('Should increase next dimension and set prev dimensions to 0, when it stay bigger then size', () => {
    const index = [0, 3, 3]
    const size = [3, 4, 4]
    const expectIndex = [1, 0, 0]

    expect(increaseIndex(index, size, 1)).toEqual(expectIndex)
  })

  it('Should increase index by step', () => {
    const index = [0, 2, 2]
    const size = [3, 4, 4]
    const expectIndex = [2, 0, 0]

    expect(increaseIndex(index, size, 2)).toEqual(expectIndex)
  })

  it('Should count endOffset if it provides', () => {
    const index = [0, 0, 2]
    const size = [3, 4, 4]
    const expectIndex = [0, 1, 0]

    expect(increaseIndex(index, size, 1, [2, 2, 2])).toEqual(expectIndex)
  })

  it('Should return -1 index when out of range', () => {
    const index = [2, 3, 3]
    const size = [3, 4, 4]
    const expectIndex = [-1, 0, 0]

    expect(increaseIndex(index, size, 1)).toEqual(expectIndex)
  })

  it('Should return -1 index when out of range with endOffset', () => {
    const index = [1, 2, 2]
    const size = [3, 4, 4]
    const expectIndex = [-1, 0, 0]

    expect(increaseIndex(index, size, 1, [2, 2, 2])).toEqual(expectIndex)
  })
})
