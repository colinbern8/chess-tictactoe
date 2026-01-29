import { useEffect, useState } from 'react'
import Board from './Board'
import GameInfo from './GameInfo'
import { checkWinner } from './game/winCondition'
import './App.css'

const BOARD_SIZE = 4
const INITIAL_PIECES = ['rook', 'knight', 'bishop', 'pawn']

const createEmptyBoard = () =>
  Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  )

const formatName = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : ''

const createInitialPiecesState = () => ({
  white: [...INITIAL_PIECES],
  black: [...INITIAL_PIECES],
})

function App() {
  const [board, setBoard] = useState(createEmptyBoard)
  const [currentPlayer, setCurrentPlayer] = useState('white')
  const [phase, setPhase] = useState('placement')
  const [remainingPieces, setRemainingPieces] = useState(
    createInitialPiecesState
  )
  const [piecesPlaced, setPiecesPlaced] = useState({
    white: [],
    black: [],
  })
  const [capturedPieces, setCapturedPieces] = useState({
    white: [],
    black: [],
  })
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [selectedMovePiece, setSelectedMovePiece] = useState(null)
  const [validMoves, setValidMoves] = useState([])
  const [winner, setWinner] = useState(null)

  useEffect(() => {
    const available = remainingPieces[currentPlayer]
    if (!available.includes(selectedPiece)) {
      setSelectedPiece(available[0] ?? null)
    }
  }, [currentPlayer, remainingPieces, selectedPiece])

  useEffect(() => {
    if (
      remainingPieces.white.length === 0 &&
      remainingPieces.black.length === 0
    ) {
      setPhase('movement')
    }
  }, [remainingPieces])

  useEffect(() => {
    setSelectedMovePiece(null)
    setValidMoves([])
  }, [currentPlayer, phase])

  const createPiece = (type, player, row) => {
    if (type !== 'pawn') {
      return { type, player }
    }
    const initialDirection = player === 'white' ? -1 : 1
    const isAtOppositeEdge =
      (player === 'white' && row === 0) ||
      (player === 'black' && row === BOARD_SIZE - 1)
    return {
      type,
      player,
      direction: isAtOppositeEdge ? -initialDirection : initialDirection,
    }
  }

  const isWithinBounds = (row, col) =>
    row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE

  const getLinearMoves = (row, col, piece, directions) => {
    const moves = []

    directions.forEach(([deltaRow, deltaCol]) => {
      let nextRow = row + deltaRow
      let nextCol = col + deltaCol

      while (isWithinBounds(nextRow, nextCol)) {
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

  const getKnightMoves = (row, col, piece) => {
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
      if (!isWithinBounds(nextRow, nextCol)) return
      const target = board[nextRow][nextCol]
      if (!target || target.player !== piece.player) {
        moves.push({ row: nextRow, col: nextCol })
      }
    })

    return moves
  }

  const getPawnMoves = (row, col, piece) => {
    const moves = []
    const direction =
      piece.direction ?? (piece.player === 'white' ? -1 : 1)

    const forwardRow = row + direction
    if (
      isWithinBounds(forwardRow, col) &&
      !board[forwardRow][col]
    ) {
      moves.push({ row: forwardRow, col })
    }

    const captureCols = [col - 1, col + 1]
    captureCols.forEach((captureCol) => {
      if (!isWithinBounds(forwardRow, captureCol)) return
      const target = board[forwardRow][captureCol]
      if (target && target.player !== piece.player) {
        moves.push({ row: forwardRow, col: captureCol })
      }
    })

    return moves
  }

  const getValidMoves = (row, col, piece) => {
    if (!piece) return []

    switch (piece.type) {
      case 'rook':
        return getLinearMoves(row, col, piece, [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ])
      case 'bishop':
        return getLinearMoves(row, col, piece, [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ])
      case 'knight':
        return getKnightMoves(row, col, piece)
      case 'pawn':
        return getPawnMoves(row, col, piece)
      default:
        return []
    }
  }

  const finalizeTurn = (nextBoard) => {
    const nextWinner = checkWinner(nextBoard)
    setBoard(nextBoard)
    setSelectedMovePiece(null)
    setValidMoves([])
    if (nextWinner) {
      setWinner(nextWinner)
      return
    }
    setCurrentPlayer((prev) => (prev === 'white' ? 'black' : 'white'))
  }

  const applyCapture = (capturedPiece) => {
    if (!capturedPiece || capturedPiece.player === currentPlayer) return

    setCapturedPieces((prev) => ({
      ...prev,
      [capturedPiece.player]: [
        ...prev[capturedPiece.player],
        capturedPiece.type,
      ],
    }))
    setRemainingPieces((prev) => ({
      ...prev,
      [capturedPiece.player]: [
        ...prev[capturedPiece.player],
        capturedPiece.type,
      ],
    }))
    setPiecesPlaced((prev) => {
      const nextPlaced = [...prev[capturedPiece.player]]
      const capturedIndex = nextPlaced.indexOf(capturedPiece.type)
      if (capturedIndex !== -1) {
        nextPlaced.splice(capturedIndex, 1)
      }
      return {
        ...prev,
        [capturedPiece.player]: nextPlaced,
      }
    })
  }

  const resetGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPlayer('white')
    setPhase('placement')
    setRemainingPieces(createInitialPiecesState())
    setPiecesPlaced({ white: [], black: [] })
    setCapturedPieces({ white: [], black: [] })
    setSelectedPiece(null)
    setSelectedMovePiece(null)
    setValidMoves([])
    setWinner(null)
  }

  const handleSelectPiece = (pieceType) => {
    if (winner) return
    if (phase === 'movement' && remainingPieces[currentPlayer].length === 0) {
      return
    }
    if (!remainingPieces[currentPlayer].includes(pieceType)) return
    setSelectedPiece(pieceType)
    setSelectedMovePiece(null)
    setValidMoves([])
  }

  const handleSquareClick = (row, col) => {
    if (winner) return

    const clickedPiece = board[row][col]
    const isOwnPiece = clickedPiece && clickedPiece.player === currentPlayer
    const isEmpty = !clickedPiece
    const canPlacePiece =
      selectedPiece && remainingPieces[currentPlayer].length > 0

    const placePiece = () => {
      const nextBoard = board.map((boardRow) => boardRow.slice())
      nextBoard[row][col] = createPiece(selectedPiece, currentPlayer, row)

      setRemainingPieces((prev) => {
        const nextPlayerPieces = [...prev[currentPlayer]]
        const pieceIndex = nextPlayerPieces.indexOf(selectedPiece)
        if (pieceIndex !== -1) {
          nextPlayerPieces.splice(pieceIndex, 1)
        }
        return {
          ...prev,
          [currentPlayer]: nextPlayerPieces,
        }
      })
      setPiecesPlaced((prev) => ({
        ...prev,
        [currentPlayer]: [...prev[currentPlayer], selectedPiece],
      }))
      setCapturedPieces((prev) => {
        const nextCaptured = [...prev[currentPlayer]]
        const capturedIndex = nextCaptured.indexOf(selectedPiece)
        if (capturedIndex !== -1) {
          nextCaptured.splice(capturedIndex, 1)
        }
        return {
          ...prev,
          [currentPlayer]: nextCaptured,
        }
      })
      finalizeTurn(nextBoard)
    }

    if (phase === 'placement') {
      if (!canPlacePiece || !isEmpty) return
      placePiece()
      return
    }

    if (selectedMovePiece) {
      const isValidDestination = validMoves.some(
        (move) => move.row === row && move.col === col
      )
      if (isValidDestination) {
        const movingPiece = { ...selectedMovePiece.piece }
        const capturedPiece = clickedPiece

        if (movingPiece.type === 'pawn') {
          const direction =
            movingPiece.direction ??
            (movingPiece.player === 'white' ? -1 : 1)
          const edgeRow = direction === -1 ? 0 : BOARD_SIZE - 1
          if (row === edgeRow) {
            movingPiece.direction = -direction
          } else {
            movingPiece.direction = direction
          }
        }

        const nextBoard = board.map((boardRow) => boardRow.slice())
        nextBoard[selectedMovePiece.row][selectedMovePiece.col] = null
        nextBoard[row][col] = movingPiece
        applyCapture(capturedPiece)

        finalizeTurn(nextBoard)
        return
      }
    }

    if (isOwnPiece) {
      if (
        selectedMovePiece &&
        selectedMovePiece.row === row &&
        selectedMovePiece.col === col
      ) {
        setSelectedMovePiece(null)
        setValidMoves([])
        return
      }
      setSelectedMovePiece({ row, col, piece: clickedPiece })
      setValidMoves(getValidMoves(row, col, clickedPiece))
      return
    }

    if (isEmpty && canPlacePiece && !selectedMovePiece) {
      placePiece()
      return
    }

    setSelectedMovePiece(null)
    setValidMoves([])
  }

  const canPlace =
    !winner &&
    selectedPiece &&
    (phase === 'placement' ||
      (phase === 'movement' && remainingPieces[currentPlayer].length > 0))

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="eyebrow">Tic-Tac-Toe Chess</p>
          <h1 className="title">4x4 Tactical Placement</h1>
          <p className="subtitle">
            Place your pieces on the grid and aim for four in a row.
          </p>
        </div>
        <div className="header-actions">
          <div className="turn-banner">
            <span className="turn-banner__label">Current turn</span>
            <span className={`player-pill player-pill--${currentPlayer}`}>
              {formatName(currentPlayer)}
            </span>
          </div>
          <button type="button" className="reset-button" onClick={resetGame}>
            New Game
          </button>
        </div>
      </header>
      <main className="game-layout">
        <Board
          board={board}
          onSquareClick={handleSquareClick}
          canPlace={canPlace}
          selectedSquare={selectedMovePiece}
          validMoves={validMoves}
        />
        <GameInfo
          currentPlayer={currentPlayer}
          phase={phase}
          remainingPieces={remainingPieces}
          capturedPieces={capturedPieces}
          piecesPlaced={piecesPlaced}
          selectedPiece={selectedPiece}
          onSelectPiece={handleSelectPiece}
          winner={winner}
          totalPieces={INITIAL_PIECES.length}
        />
      </main>
    </div>
  )
}

export default App
