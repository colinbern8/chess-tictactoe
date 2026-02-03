const getWinnerFromLine = (line, positions) => {
  if (!line.length) return null
  const first = line[0]
  if (!first) return null
  const isWinningLine = line.every(
    (square) => square && square.player === first.player
  )
  if (!isWinningLine) return null
  return { winner: first.player, winningSquares: positions }
}

export const checkWinner = (board) => {
  const size = board.length
  if (!size) return { winner: null, winningSquares: [] }

  for (let row = 0; row < size; row += 1) {
    const positions = board[row].map((_, col) => ({ row, col }))
    const result = getWinnerFromLine(board[row], positions)
    if (result) return result
  }

  for (let col = 0; col < size; col += 1) {
    const column = []
    const positions = []
    for (let row = 0; row < size; row += 1) {
      column.push(board[row][col])
      positions.push({ row, col })
    }
    const result = getWinnerFromLine(column, positions)
    if (result) return result
  }

  const diagonal = []
  const antiDiagonal = []
  const diagonalPositions = []
  const antiDiagonalPositions = []
  for (let index = 0; index < size; index += 1) {
    diagonal.push(board[index][index])
    diagonalPositions.push({ row: index, col: index })
    const antiCol = size - 1 - index
    antiDiagonal.push(board[index][antiCol])
    antiDiagonalPositions.push({ row: index, col: antiCol })
  }
  const diagonalResult = getWinnerFromLine(diagonal, diagonalPositions)
  if (diagonalResult) return diagonalResult
  const antiDiagonalResult = getWinnerFromLine(
    antiDiagonal,
    antiDiagonalPositions
  )
  if (antiDiagonalResult) return antiDiagonalResult

  return { winner: null, winningSquares: [] }
}

const countInDirection = (board, row, col, deltaRow, deltaCol, player) => {
  const size = board.length
  let count = 0
  let nextRow = row + deltaRow
  let nextCol = col + deltaCol

  while (nextRow >= 0 && nextRow < size && nextCol >= 0 && nextCol < size) {
    const target = board[nextRow][nextCol]
    if (!target || target.player !== player) break
    count += 1
    nextRow += deltaRow
    nextCol += deltaCol
  }

  return count
}

export const isValidWin = (board, lastMove) => {
  if (!board || !board.length) return false
  if (!lastMove || lastMove.type !== 'move') return false

  const { row, col } = lastMove
  if (!Number.isInteger(row) || !Number.isInteger(col)) return false
  if (row < 0 || col < 0 || row >= board.length || col >= board.length) {
    return false
  }

  const piece = board[row][col]
  if (!piece) return false

  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ]
  const needed = 4

  return directions.some(([deltaRow, deltaCol]) => {
    const total =
      1 +
      countInDirection(board, row, col, deltaRow, deltaCol, piece.player) +
      countInDirection(board, row, col, -deltaRow, -deltaCol, piece.player)
    return total >= needed
  })
}
