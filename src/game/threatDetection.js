import { BOARD_SIZE } from './gameConstants'

const getLineSquares = () => {
  const lines = []

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    lines.push(
      Array.from({ length: BOARD_SIZE }, (_, col) => ({ row, col }))
    )
  }

  for (let col = 0; col < BOARD_SIZE; col += 1) {
    lines.push(
      Array.from({ length: BOARD_SIZE }, (_, row) => ({ row, col }))
    )
  }

  lines.push(
    Array.from({ length: BOARD_SIZE }, (_, index) => ({
      row: index,
      col: index,
    }))
  )
  lines.push(
    Array.from({ length: BOARD_SIZE }, (_, index) => ({
      row: index,
      col: BOARD_SIZE - 1 - index,
    }))
  )

  return lines
}

const LINES = getLineSquares()

export const findThreats = (board, player) => {
  const threats = []

  LINES.forEach((line) => {
    let playerCount = 0
    let emptySquare = null
    const occupiedSquares = []
    let hasOpponent = false

    line.forEach(({ row, col }) => {
      const piece = board[row][col]
      if (!piece) {
        emptySquare = { row, col }
        return
      }
      if (piece.player === player) {
        playerCount += 1
        occupiedSquares.push({ row, col })
        return
      }
      hasOpponent = true
    })

    if (!hasOpponent && playerCount === 3 && emptySquare) {
      threats.push({
        squares: occupiedSquares,
        blockSquare: emptySquare,
      })
    }
  })

  return threats
}

export const getBlockingSquare = (board, currentPlayer) => {
  const opponent = currentPlayer === 'white' ? 'black' : 'white'
  const threats = findThreats(board, opponent)

  if (threats.length === 0) return null

  const uniqueBlocks = new Map()
  threats.forEach(({ blockSquare }) => {
    uniqueBlocks.set(`${blockSquare.row}-${blockSquare.col}`, blockSquare)
  })

  if (uniqueBlocks.size === 1) {
    return [...uniqueBlocks.values()][0]
  }

  return 'unblockable'
}
