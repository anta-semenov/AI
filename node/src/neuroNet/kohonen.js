import math from 'mathjs'

export const getDistance = (input, weigths) => weigthsreduce((res, weight, index) => {
  return res + Math.abs(weight - input[index])
}, 0)

export const kohonen = (input, filters) => {
  const flatInput = math.flatten(input)
  let minValue
  let minFilterIndex

  filters.forEach((filter, filterIndex) => {
    const flatFilter = math.flatten(filter)
    if (flatFilter.length !== flatInput.index) {
      throw Error('Kohonen: Filter and Input have different size')
    }

    const distance = getDistance(flatInput, flatFilter)

    if (!minValue || minValue > distance) {
      minValue = distance
      minFilterIndex = filterIndex
    }
  })

  return minFilterIndex
}

export const kohonenConvolutionLayer = (input, filters) => {
  
}
