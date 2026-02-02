import { getValidMoves } from './pieceMovement'

const AI_PLAYER = 'black'

const pickRandom = (items) => items[Math.floor(Math.random() * items.length)]

export const getAIMove = (board, remainingPieces, phase) => {
  if (!board || !board.length) return null

  if (phase === 'placement') {
    const availablePieces = Array.isArray(remainingPieces)
      ? remainingPieces
      : remainingPieces?.[AI_PLAYER] ?? []
    if (!availablePieces.length) return null

    const emptySquares = []
    for (let row = 0; row < board.length; row += 1) {
      for (let col = 0; col < board[row].length; col += 1) {
        if (!board[row][col]) {
          emptySquares.push({ row, col })
        }
      }
    }
    if (!emptySquares.length) return null

    const { row, col } = pickRandom(emptySquares)
    const piece = pickRandom(availablePieces)
    return { type: 'place', piece, row, col }
  }

  const captureMoves = []
  const normalMoves = []

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      const piece = board[row][col]
      if (!piece || piece.player !== AI_PLAYER) continue
      const moves = getValidMoves(board, row, col, piece)
      moves.forEach((move) => {
        const target = board[move.row][move.col]
        const movePayload = {
          type: 'move',
          fromRow: row,
          fromCol: col,
          toRow: move.row,
          toCol: move.col,
        }
        if (target && target.player !== AI_PLAYER) {
          captureMoves.push(movePayload)
        } else {
          normalMoves.push(movePayload)
        }
      })
    }
  }

  if (captureMoves.length) {
    return pickRandom(captureMoves)
  }
  if (normalMoves.length) {
    return pickRandom(normalMoves)
  }

  return null
}
