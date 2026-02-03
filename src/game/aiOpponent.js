import { getValidMoves } from './pieceMovement'

const isDev = import.meta.env.DEV

const pickRandom = (items) => items[Math.floor(Math.random() * items.length)]

const getAvailablePieces = (remainingPieces, aiPlayer) => {
  if (Array.isArray(remainingPieces)) return remainingPieces
  return remainingPieces?.[aiPlayer] ?? []
}

const getEmptySquares = (board) => {
  const emptySquares = []
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (!board[row][col]) {
        emptySquares.push({ row, col })
      }
    }
  }
  return emptySquares
}

const isCenterSquare = (row, col, size) =>
  row >= 1 && row <= size - 2 && col >= 1 && col <= size - 2

const isCornerSquare = (row, col, size) =>
  (row === 0 || row === size - 1) && (col === 0 || col === size - 1)

const isEdgeSquare = (row, col, size) =>
  row === 0 || row === size - 1 || col === 0 || col === size - 1

const getLinePositions = (size) => {
  const lines = []
  for (let row = 0; row < size; row += 1) {
    const line = []
    for (let col = 0; col < size; col += 1) {
      line.push({ row, col })
    }
    lines.push(line)
  }
  for (let col = 0; col < size; col += 1) {
    const line = []
    for (let row = 0; row < size; row += 1) {
      line.push({ row, col })
    }
    lines.push(line)
  }
  const diagonal = []
  const antiDiagonal = []
  for (let index = 0; index < size; index += 1) {
    diagonal.push({ row: index, col: index })
    antiDiagonal.push({ row: index, col: size - 1 - index })
  }
  lines.push(diagonal, antiDiagonal)
  return lines
}

const countInARow = (board, player) => {
  const size = board.length
  const lines = getLinePositions(size)
  let maxCount = 0
  lines.forEach((line) => {
    let run = 0
    line.forEach((pos) => {
      const piece = board[pos.row][pos.col]
      if (piece && piece.player === player) {
        run += 1
        if (run > maxCount) maxCount = run
      } else {
        run = 0
      }
    })
  })
  return maxCount
}

const getThreats = (board, player) => {
  const size = board.length
  const lines = getLinePositions(size)
  const threatSet = new Set()
  lines.forEach((line) => {
    let playerCount = 0
    let opponentFound = false
    const emptySquares = []
    line.forEach((pos) => {
      const piece = board[pos.row][pos.col]
      if (!piece) {
        emptySquares.push(pos)
      } else if (piece.player === player) {
        playerCount += 1
      } else {
        opponentFound = true
      }
    })
    if (!opponentFound && playerCount === size - 1 && emptySquares.length === 1) {
      const { row, col } = emptySquares[0]
      threatSet.add(`${row},${col}`)
    }
  })
  return Array.from(threatSet).map((entry) => {
    const [row, col] = entry.split(',').map(Number)
    return { row, col }
  })
}

const canWinNextMove = (board, player) => {
  const threats = getThreats(board, player)
  return threats.length ? threats[0] : null
}

const cloneBoard = (board) =>
  board.map((row) =>
    row.map((cell) => (cell ? { ...cell } : null))
  )

const applyMove = (board, move) => {
  const nextBoard = cloneBoard(board)
  const piece = nextBoard[move.fromRow][move.fromCol]
  nextBoard[move.fromRow][move.fromCol] = null
  nextBoard[move.toRow][move.toCol] = piece
  return nextBoard
}

const getAllMoves = (board, player) => {
  const moves = []
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      const piece = board[row][col]
      if (!piece || piece.player !== player) continue
      const validMoves = getValidMoves(board, row, col, piece)
      validMoves.forEach((move) => {
        const target = board[move.row][move.col]
        moves.push({
          fromRow: row,
          fromCol: col,
          toRow: move.row,
          toCol: move.col,
          isCapture: Boolean(target && target.player !== player),
        })
      })
    }
  }
  return moves
}

const findWinningMoves = (board, player, moves) => {
  const size = board.length
  const winners = []
  moves.forEach((move) => {
    const nextBoard = applyMove(board, move)
    if (countInARow(nextBoard, player) >= size) {
      winners.push(move)
    }
  })
  return winners
}

const opponentHasWinningMove = (board, player) => {
  const moves = getAllMoves(board, player)
  const size = board.length
  return moves.some((move) => {
    const nextBoard = applyMove(board, move)
    return countInARow(nextBoard, player) >= size
  })
}

const findBlockingMoves = (moves, threatSquares) => {
  if (!threatSquares.length) return []
  const threatSet = new Set(
    threatSquares.map((square) => `${square.row},${square.col}`)
  )
  return moves.filter((move) => threatSet.has(`${move.toRow},${move.toCol}`))
}

const scoreMove = (board, move, opponentThreats, aiPlayer, opponent) => {
  const size = board.length
  const nextBoard = applyMove(board, move)
  const aiBefore = countInARow(board, aiPlayer)
  const aiAfter = countInARow(nextBoard, aiPlayer)
  const opponentBefore = countInARow(board, opponent)
  const opponentAfter = countInARow(nextBoard, opponent)
  let score = 0

  if (aiAfter >= size) score += 100
  if (
    opponentThreats.has(`${move.toRow},${move.toCol}`)
  ) {
    score += 80
  }
  if (aiAfter >= size - 1 && aiAfter > aiBefore) score += 40
  if (opponentBefore >= size - 1 && opponentAfter < opponentBefore) score += 30
  if (move.isCapture) score += 20

  if (isCenterSquare(move.toRow, move.toCol, size)) score += 10
  else if (isCornerSquare(move.toRow, move.toCol, size)) score += 5
  else if (isEdgeSquare(move.toRow, move.toCol, size)) score += 2

  return score
}

const pickRandomMove = (moves) => {
  if (!moves.length) return null
  return pickRandom(moves)
}

const withMoveType = (move) => (move ? { type: 'move', ...move } : null)

const pickBestMove = (scoredMoves) => {
  if (!scoredMoves.length) return null
  let bestScore = -Infinity
  let bestMoves = []
  scoredMoves.forEach((move) => {
    if (move.score > bestScore) {
      bestScore = move.score
      bestMoves = [move]
    } else if (move.score === bestScore) {
      bestMoves.push(move)
    }
  })
  return pickRandom(bestMoves)
}

const getPlacementMoveEasy = (board, availablePieces) => {
  const emptySquares = getEmptySquares(board)
  if (!emptySquares.length) return null
  const square = pickRandom(emptySquares)
  const piece = pickRandom(availablePieces)
  return { type: 'place', piece, row: square.row, col: square.col }
}

const getPlacementMoveMedium = (board, availablePieces) => {
  const emptySquares = getEmptySquares(board)
  if (!emptySquares.length) return null
  const size = board.length
  const useRandom = Math.random() < 0.3
  const centerSquares = emptySquares.filter((square) =>
    isCenterSquare(square.row, square.col, size)
  )
  const candidateSquares =
    !useRandom && centerSquares.length ? centerSquares : emptySquares
  const square = pickRandom(candidateSquares)
  const piece = pickRandom(availablePieces)
  return { type: 'place', piece, row: square.row, col: square.col }
}

const getPlacementMoveHard = (board, availablePieces) => {
  const emptySquares = getEmptySquares(board)
  if (!emptySquares.length) return null
  const size = board.length
  const centerSquares = emptySquares.filter((square) =>
    isCenterSquare(square.row, square.col, size)
  )
  const cornerSquares = emptySquares.filter((square) =>
    isCornerSquare(square.row, square.col, size)
  )
  const edgeSquares = emptySquares.filter((square) =>
    isEdgeSquare(square.row, square.col, size)
  )
  const candidateSquares =
    centerSquares.length
      ? centerSquares
      : cornerSquares.length
        ? cornerSquares
        : edgeSquares
  const square = pickRandom(candidateSquares)
  const piece = pickRandom(availablePieces)
  return { type: 'place', piece, row: square.row, col: square.col }
}

const getMovementMoveEasy = (board, aiPlayer) => {
  const aiMoves = getAllMoves(board, aiPlayer)
  if (!aiMoves.length) return null
  const movesByPiece = new Map()
  aiMoves.forEach((move) => {
    const key = `${move.fromRow},${move.fromCol}`
    if (!movesByPiece.has(key)) movesByPiece.set(key, [])
    movesByPiece.get(key).push(move)
  })
  const pieceKeys = Array.from(movesByPiece.keys())
  if (!pieceKeys.length) return null
  const pieceKey = pickRandom(pieceKeys)
  const moves = movesByPiece.get(pieceKey) || []
  return pickRandomMove(moves)
}

const getMovementMoveMedium = (board, aiPlayer, opponent) => {
  const moves = getAllMoves(board, aiPlayer)
  if (!moves.length) return null

  const winningMoves = findWinningMoves(board, aiPlayer, moves)
  if (winningMoves.length) return pickRandomMove(winningMoves)

  const shouldIgnoreBlock = Math.random() < 0.2
  const opponentThreats = getThreats(board, opponent)
  const blockingMoves = shouldIgnoreBlock
    ? []
    : findBlockingMoves(moves, opponentThreats)
  if (blockingMoves.length) return pickRandomMove(blockingMoves)

  return pickRandomMove(moves)
}

const getMovementMoveHard = (board, aiPlayer, opponent) => {
  const moves = getAllMoves(board, aiPlayer)
  if (!moves.length) return null

  const winningMoves = findWinningMoves(board, aiPlayer, moves)
  if (winningMoves.length) return pickRandomMove(winningMoves)

  const opponentThreats = getThreats(board, opponent)
  const blockingMoves = findBlockingMoves(moves, opponentThreats)
  if (blockingMoves.length) return pickRandomMove(blockingMoves)

  const setupMoves = moves.filter((move) => {
    const nextBoard = applyMove(board, move)
    return getThreats(nextBoard, aiPlayer).length > 0
  })
  if (setupMoves.length) return pickRandomMove(setupMoves)

  const safeCaptures = moves.filter((move) => {
    if (!move.isCapture) return false
    const nextBoard = applyMove(board, move)
    return !opponentHasWinningMove(nextBoard, opponent)
  })
  if (safeCaptures.length) return pickRandomMove(safeCaptures)

  const size = board.length
  const centerMoves = moves.filter((move) =>
    isCenterSquare(move.toRow, move.toCol, size)
  )
  if (centerMoves.length) return pickRandomMove(centerMoves)

  const opponentThreatSet = new Set(
    opponentThreats.map((square) => `${square.row},${square.col}`)
  )
  const scoredMoves = moves.map((move) => ({
    ...move,
    score: scoreMove(board, move, opponentThreatSet, aiPlayer, opponent),
  }))
  return pickBestMove(scoredMoves)
}

export const getAIMove = (
  board,
  remainingPieces,
  phase,
  difficulty,
  aiPlayer = 'black'
) => {
  try {
    if (!board || !board.length) return null

    const opponent = aiPlayer === 'white' ? 'black' : 'white'
    const normalizedDifficulty = difficulty || 'medium'
    const availablePieces = getAvailablePieces(remainingPieces, aiPlayer)

    if (isDev) {
      console.log('[AI] getAIMove', {
        phase,
        difficulty: normalizedDifficulty,
        availablePieces: availablePieces.length,
        boardSize: board.length,
        aiPlayer,
      })
    }

    if (phase === 'placement' && availablePieces.length) {
      if (normalizedDifficulty === 'easy') {
        return getPlacementMoveEasy(board, availablePieces)
      }
      if (normalizedDifficulty === 'hard') {
        return getPlacementMoveHard(board, availablePieces)
      }
      return getPlacementMoveMedium(board, availablePieces)
    }

    if (normalizedDifficulty === 'easy') {
      return withMoveType(getMovementMoveEasy(board, aiPlayer))
    }
    if (normalizedDifficulty === 'hard') {
      return withMoveType(getMovementMoveHard(board, aiPlayer, opponent))
    }
    return withMoveType(getMovementMoveMedium(board, aiPlayer, opponent))
  } catch (error) {
    if (isDev) {
      console.error('[AI] getAIMove error', error)
    }
    return null
  }
}
