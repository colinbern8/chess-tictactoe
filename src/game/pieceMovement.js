const isWithinBounds = (row, col, boardSize) =>
  row >= 0 && row < boardSize && col >= 0 && col < boardSize

const getLinearMoves = (board, row, col, piece, directions) => {
  const boardSize = board.length
  const moves = []

  directions.forEach(([deltaRow, deltaCol]) => {
    let nextRow = row + deltaRow
    let nextCol = col + deltaCol

    while (isWithinBounds(nextRow, nextCol, boardSize)) {
      const target = board[nextRow][nextCol]
      if (!target) {
        moves.push({ row: nextRow, col: nextCol })
      } else {
        if (target.player !== piece.player) {
          moves.push({ row: nextRow, col: nextCol })
        }
        break
      }
      nextRow += deltaRow
      nextCol += deltaCol
    }
  })

  return moves
}

const getKnightMoves = (board, row, col, piece) => {
  const boardSize = board.length
  const moves = []
  const offsets = [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ]

  offsets.forEach(([deltaRow, deltaCol]) => {
    const nextRow = row + deltaRow
    const nextCol = col + deltaCol
    if (!isWithinBounds(nextRow, nextCol, boardSize)) return
    const target = board[nextRow][nextCol]
    if (!target || target.player !== piece.player) {
      moves.push({ row: nextRow, col: nextCol })
    }
  })

  return moves
}

const getPawnDirection = (piece, row, boardSize) => {
  let direction =
    typeof piece.direction === 'number'
      ? piece.direction
      : piece.player === 'white'
        ? -1
        : 1

  if (direction === -1 && row === 0) {
    direction = 1
  }
  if (direction === 1 && row === boardSize - 1) {
    direction = -1
  }

  return direction
}

const getPawnMoves = (board, row, col, piece) => {
  const boardSize = board.length
  const moves = []
  const direction = getPawnDirection(piece, row, boardSize)
  const forwardRow = row + direction

  if (isWithinBounds(forwardRow, col, boardSize) && !board[forwardRow][col]) {
    moves.push({ row: forwardRow, col })
  }

  const captureCols = [col - 1, col + 1]
  captureCols.forEach((captureCol) => {
    if (!isWithinBounds(forwardRow, captureCol, boardSize)) return
    const target = board[forwardRow][captureCol]
    if (target && target.player !== piece.player) {
      moves.push({ row: forwardRow, col: captureCol })
    }
  })

  return moves
}

export const getValidMoves = (board, row, col, piece) => {
  if (!piece) return []
  const boardSize = board.length
  if (!isWithinBounds(row, col, boardSize)) return []

  switch (piece.type) {
    case 'rook':
      return getLinearMoves(board, row, col, piece, [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ])
    case 'bishop':
      return getLinearMoves(board, row, col, piece, [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ])
    case 'knight':
      return getKnightMoves(board, row, col, piece)
    case 'pawn':
      return getPawnMoves(board, row, col, piece)
    default:
      return []
  }
}
