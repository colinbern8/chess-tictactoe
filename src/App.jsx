import { useEffect, useState } from 'react'
import Board from './Board'
import GameInfo from './GameInfo'
import './App.css'

const BOARD_SIZE = 4
const INITIAL_PIECES = ['rook', 'knight', 'bishop', 'pawn']

const createEmptyBoard = () =>
  Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  )

const formatName = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : ''

function App() {
  const [board, setBoard] = useState(createEmptyBoard)
  const [currentPlayer, setCurrentPlayer] = useState('white')
  const [phase, setPhase] = useState('placement')
  const [remainingPieces, setRemainingPieces] = useState({
    white: [...INITIAL_PIECES],
    black: [...INITIAL_PIECES],
  })
  const [piecesPlaced, setPiecesPlaced] = useState({
    white: [],
    black: [],
  })
  const [capturedPieces] = useState({
    white: [],
    black: [],
  })
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [validMoves, setValidMoves] = useState([])
  const [winner] = useState(null)

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

  const handleSelectPiece = (pieceType) => {
    if (phase !== 'placement' || winner) return
    if (!remainingPieces[currentPlayer].includes(pieceType)) return
    setSelectedPiece(pieceType)
  }

  const handleSquareClick = (row, col) => {
    if (phase !== 'placement' || winner) return
    if (!selectedPiece) return
    if (board[row][col]) return

    const nextBoard = board.map((boardRow) => boardRow.slice())
    nextBoard[row][col] = {
      type: selectedPiece,
      player: currentPlayer,
    }

    setBoard(nextBoard)
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
    setSelectedSquare({ row, col })
    setValidMoves([])
    setCurrentPlayer((prev) => (prev === 'white' ? 'black' : 'white'))
  }

  const canPlace = phase === 'placement' && !winner

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
        <div className="turn-banner">
          <span className="turn-banner__label">Current turn</span>
          <span className={`player-pill player-pill--${currentPlayer}`}>
            {formatName(currentPlayer)}
          </span>
        </div>
      </header>
      <main className="game-layout">
        <Board
          board={board}
          onSquareClick={handleSquareClick}
          canPlace={canPlace}
          selectedSquare={selectedSquare}
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
