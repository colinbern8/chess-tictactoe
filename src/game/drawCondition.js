import { getValidMoves } from './pieceMovement'
import { checkWinner } from './winCondition'

export const checkDraw = (board, currentPlayer, remainingPieces) => {
  if (!board || !board.length) return false
  if (checkWinner(board)) return false

  const remainingForPlayer = Array.isArray(remainingPieces)
    ? remainingPieces
    : remainingPieces?.[currentPlayer] ?? []

  if (remainingForPlayer.length > 0) return false

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      const piece = board[row][col]
      if (!piece || piece.player !== currentPlayer) continue
      const moves = getValidMoves(board, row, col, piece)
      if (moves.length) return false
    }
  }

  return true
}
