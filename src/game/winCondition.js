const getWinnerFromLine = (line) => {
  if (!line.length) return null
  const first = line[0]
  if (!first) return null
  const isWinningLine = line.every(
    (square) => square && square.player === first.player
  )
  return isWinningLine ? first.player : null
}

export const checkWinner = (board) => {
  const size = board.length
  if (!size) return null

  for (let row = 0; row < size; row += 1) {
    const winner = getWinnerFromLine(board[row])
    if (winner) return winner
  }

  for (let col = 0; col < size; col += 1) {
    const column = []
    for (let row = 0; row < size; row += 1) {
      column.push(board[row][col])
    }
    const winner = getWinnerFromLine(column)
    if (winner) return winner
  }

  const diagonal = []
  const antiDiagonal = []
  for (let index = 0; index < size; index += 1) {
    diagonal.push(board[index][index])
    antiDiagonal.push(board[index][size - 1 - index])
  }
  const diagonalWinner = getWinnerFromLine(diagonal)
  if (diagonalWinner) return diagonalWinner
  const antiDiagonalWinner = getWinnerFromLine(antiDiagonal)
  if (antiDiagonalWinner) return antiDiagonalWinner

  return null
}
