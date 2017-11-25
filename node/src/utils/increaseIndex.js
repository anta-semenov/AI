export const increaseIndex = (index: number[], indexSize: number[], step: number, endOffset: number[] = []): number[] => {
  let i = index.length
  const newIndex: number[] = []
  let wasIncreased = false

  while (i) {
    i--

    if (wasIncreased) {
      newIndex[i] = index[i]
      continue
    }

    if (index[i] + step > indexSize[i] - (endOffset[i] || 1)) {
      newIndex[i] = i === 0 ? -1 : 0
    } else {
      wasIncreased = true
      newIndex[i] = index[i] + step
    }
  }

  return newIndex
}
