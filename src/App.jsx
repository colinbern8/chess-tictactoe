import { useEffect, useState } from 'react'
import Board from './Board'
import GameInfo from './GameInfo'
import GameMenu from './components/GameMenu'
import { getValidMoves } from './game/pieceMovement'
import { checkWinner } from './game/winCondition'
import { checkDraw } from './game/drawCondition'
import { getAIMove } from './game/aiOpponent'
import { BOARD_SIZE, INITIAL_PIECES } from './game/gameConstants'
import './App.css'

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
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState('2player')
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
  const [isDraw, setIsDraw] = useState(false)

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
    setGameStarted(false)
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
    setIsDraw(false)
  }

  const handleStartGame = ({ mode }) => {
    setGameMode(mode)
    setGameStarted(true)
  }

  const handleSelectPiece = (pieceType) => {
    if (winner || isDraw) return
    if (gameMode === 'ai' && currentPlayer === 'black') return
    if (phase === 'movement' && remainingPieces[currentPlayer].length === 0) {
      return
    }
    if (!remainingPieces[currentPlayer].includes(pieceType)) return
    setSelectedPiece(pieceType)
    setSelectedMovePiece(null)
    setValidMoves([])
  }

  const handleSquareClick = (row, col) => {
    if (winner || isDraw) return
    if (gameMode === 'ai' && currentPlayer === 'black') return

    const clickedPiece = board[row][col]
    const isOwnPiece = clickedPiece && clickedPiece.player === currentPlayer
    const isEmpty = !clickedPiece
    const canPlacePiece =
      selectedPiece && remainingPieces[currentPlayer].length > 0

    const placePiece = (pieceType, player) => {
      const nextBoard = board.map((boardRow) => boardRow.slice())
      nextBoard[row][col] = createPiece(pieceType, player, row)

      setRemainingPieces((prev) => {
        const nextPlayerPieces = [...prev[player]]
        const pieceIndex = nextPlayerPieces.indexOf(pieceType)
        if (pieceIndex !== -1) {
          nextPlayerPieces.splice(pieceIndex, 1)
        }
        return {
          ...prev,
          [player]: nextPlayerPieces,
        }
      })
      setPiecesPlaced((prev) => ({
        ...prev,
        [player]: [...prev[player], pieceType],
      }))
      setCapturedPieces((prev) => {
        const nextCaptured = [...prev[player]]
        const capturedIndex = nextCaptured.indexOf(pieceType)
        if (capturedIndex !== -1) {
          nextCaptured.splice(capturedIndex, 1)
        }
        return {
          ...prev,
          [player]: nextCaptured,
        }
      })
      finalizeTurn(nextBoard)
    }

    if (phase === 'placement') {
      if (!canPlacePiece || !isEmpty) return
      placePiece(selectedPiece, currentPlayer)
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
      setValidMoves(getValidMoves(board, row, col, clickedPiece))
      return
    }

    if (isEmpty && canPlacePiece && !selectedMovePiece) {
      placePiece(selectedPiece, currentPlayer)
      return
    }

    setSelectedMovePiece(null)
    setValidMoves([])
  }

  const canPlace =
    !winner &&
    !isDraw &&
    selectedPiece &&
    (phase === 'placement' ||
      (phase === 'movement' && remainingPieces[currentPlayer].length > 0))

  useEffect(() => {
    if (!gameStarted || winner || isDraw) return
    if (checkDraw(board, currentPlayer, remainingPieces)) {
      setIsDraw(true)
    }
  }, [board, currentPlayer, remainingPieces, winner, isDraw, gameStarted])

  useEffect(() => {
    if (!gameStarted) return undefined
    if (gameMode !== 'ai') return undefined
    if (currentPlayer !== 'black') return undefined
    if (winner || isDraw) return undefined

    const timeoutId = setTimeout(() => {
      const aiMove = getAIMove(board, remainingPieces, phase)
      if (!aiMove) return
      if (aiMove.type === 'place') {
        const { piece, row, col } = aiMove
        if (board[row][col]) return
        const nextBoard = board.map((boardRow) => boardRow.slice())
        nextBoard[row][col] = createPiece(piece, 'black', row)

        setRemainingPieces((prev) => {
          const nextPlayerPieces = [...prev.black]
          const pieceIndex = nextPlayerPieces.indexOf(piece)
          if (pieceIndex !== -1) {
            nextPlayerPieces.splice(pieceIndex, 1)
          }
          return {
            ...prev,
            black: nextPlayerPieces,
          }
        })
        setPiecesPlaced((prev) => ({
          ...prev,
          black: [...prev.black, piece],
        }))
        setCapturedPieces((prev) => {
          const nextCaptured = [...prev.black]
          const capturedIndex = nextCaptured.indexOf(piece)
          if (capturedIndex !== -1) {
            nextCaptured.splice(capturedIndex, 1)
          }
          return {
            ...prev,
            black: nextCaptured,
          }
        })
        finalizeTurn(nextBoard)
        return
      }

      if (aiMove.type === 'move') {
        const { fromRow, fromCol, toRow, toCol } = aiMove
        const movingPiece = board[fromRow]?.[fromCol]
        if (!movingPiece) return
        const nextMovingPiece = { ...movingPiece }
        const capturedPiece = board[toRow]?.[toCol] ?? null

        if (nextMovingPiece.type === 'pawn') {
          const direction =
            nextMovingPiece.direction ??
            (nextMovingPiece.player === 'white' ? -1 : 1)
          const edgeRow = direction === -1 ? 0 : BOARD_SIZE - 1
          if (toRow === edgeRow) {
            nextMovingPiece.direction = -direction
          } else {
            nextMovingPiece.direction = direction
          }
        }

        const nextBoard = board.map((boardRow) => boardRow.slice())
        nextBoard[fromRow][fromCol] = null
        nextBoard[toRow][toCol] = nextMovingPiece
        applyCapture(capturedPiece)
        finalizeTurn(nextBoard)
      }
    }, 600)

    return () => clearTimeout(timeoutId)
  }, [
    board,
    currentPlayer,
    gameMode,
    gameStarted,
    isDraw,
    phase,
    remainingPieces,
    winner,
  ])

  if (!gameStarted) {
    return <GameMenu onStart={handleStartGame} />
  }

  return (
    <div className="app" data-game-mode={gameMode}>
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
          isDraw={isDraw}
          totalPieces={INITIAL_PIECES.length}
        />
      </main>
    </div>
  )
}

export default App
