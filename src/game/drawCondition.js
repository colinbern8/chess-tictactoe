export const checkDraw = (boardHistory, moveCount, lastCaptureMove) => {
  void lastCaptureMove

  if (Array.isArray(boardHistory) && boardHistory.length) {
    const counts = new Map()
    for (const snapshot of boardHistory) {
      const nextCount = (counts.get(snapshot) ?? 0) + 1
      if (nextCount >= 3) {
        return 'threefold'
      }
      counts.set(snapshot, nextCount)
    }
  }

  if (typeof moveCount === 'number' && moveCount >= 40) {
    return '40move'
  }

  return null
}
