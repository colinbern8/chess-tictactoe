import { useEffect, useState } from 'react'
import Board from './Board'
import GameInfo from './GameInfo'
import GameMenu from './components/GameMenu'
import EndGameModal from './components/EndGameModal'
import Tutorial from './components/Tutorial'
import { getValidMoves } from './game/pieceMovement'
import { checkWinner } from './game/winCondition'
import { checkDraw } from './game/drawCondition'
import { getAIMove } from './game/aiOpponent'
import { BOARD_SIZE, INITIAL_PIECES } from './game/gameConstants'
import { playSound } from './game/soundManager'
import { findThreats, getBlockingSquare } from './game/threatDetection'
import './App.css'
import './components/EndGameModal.css'
import './components/Tutorial.css'

const isDev = import.meta.env.DEV

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
  const [gameMode, setGameMode] = useState(null)
  const [difficulty, setDifficulty] = useState('medium')
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
  const [winningSquares, setWinningSquares] = useState([])
  const [isDraw, setIsDraw] = useState(false)
  const [drawReason, setDrawReason] = useState(null)
  const [boardHistory, setBoardHistory] = useState([])
  const [movesSinceCapture, setMovesSinceCapture] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showEndGame, setShowEndGame] = useState(false)
  const [moveHistory, setMoveHistory] = useState([])
  const [history, setHistory] = useState([])
  const [isMuted, setIsMuted] = useState(false)
  const [forcedBlockSquare, setForcedBlockSquare] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [aiPlayer, setAiPlayer] = useState(null)
  const [humanPlayer, setHumanPlayer] = useState(null)

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

  useEffect(() => {
    if (phase === 'movement') {
      setForcedBlockSquare(null)
      setStatusMessage('')
    }
  }, [phase])

  useEffect(() => {
    setShowTutorial(true)
  }, [])

  useEffect(() => {
    if (winner || isDraw) {
      setShowEndGame(true)
    }
  }, [winner, isDraw])

  useEffect(() => {
    if (winner) {
      playSound('win', isMuted)
      return
    }
    if (isDraw) {
      playSound('draw', isMuted)
    }
  }, [winner, isDraw, isMuted])

  const createPiece = (type, player, row) => {
    if (type !== 'pawn') {
      return {
        type,
        player,
        ...(type === 'bishop' ? { hasUsedOrthogonal: false } : {}),
      }
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

  const resetBishopOrthogonalForPlayer = (nextBoard, player) => {
    let didReset = false
    const updatedBoard = nextBoard.map((boardRow) =>
      boardRow.map((piece) => {
        if (
          piece &&
          piece.player === player &&
          piece.type === 'bishop' &&
          piece.hasUsedOrthogonal
        ) {
          didReset = true
          return { ...piece, hasUsedOrthogonal: false }
        }
        return piece
      })
    )
    return didReset ? updatedBoard : nextBoard
  }

  const cloneBoardState = (sourceBoard) =>
    sourceBoard.map((boardRow) =>
      boardRow.map((piece) => (piece ? { ...piece } : null))
    )

  const clonePiecesState = (source) => ({
    white: [...source.white],
    black: [...source.black],
  })

  const cloneMoveHistory = (moves) =>
    moves.map((move) => ({
      ...move,
      from: move.from ? { ...move.from } : null,
      to: move.to ? { ...move.to } : null,
    }))

  const pushHistorySnapshot = () => {
    const snapshot = {
      board: cloneBoardState(board),
      currentPlayer,
      remainingPieces: clonePiecesState(remainingPieces),
      capturedPieces: clonePiecesState(capturedPieces),
      piecesPlaced: clonePiecesState(piecesPlaced),
      phase,
      moveHistory: cloneMoveHistory(moveHistory),
      boardHistory: [...boardHistory],
      movesSinceCapture,
      forcedBlockSquare,
      statusMessage,
    }
    setHistory((prev) => [...prev, snapshot])
  }

  const finalizeTurn = (nextBoard, wasCapture) => {
    setSelectedMovePiece(null)
    setValidMoves([])

    if (phase === 'movement') {
      const { winner: lineWinner, winningSquares: lineWinningSquares } =
        checkWinner(nextBoard)

      if (lineWinner) {
        setBoard(nextBoard)
        setWinner(lineWinner)
        setWinningSquares(lineWinningSquares)
        return
      }
    }

    const nextPlayer = currentPlayer === 'white' ? 'black' : 'white'
    const resetBoard = resetBishopOrthogonalForPlayer(nextBoard, nextPlayer)
    const nextSnapshot = JSON.stringify(resetBoard)
    const nextHistory = [...boardHistory, nextSnapshot]
    const nextMovesSinceCapture =
      phase === 'movement' ? (wasCapture ? 0 : movesSinceCapture) + 1 : 0

    setBoardHistory(nextHistory)
    setMovesSinceCapture(nextMovesSinceCapture)

    let drawResult = null
    if (phase === 'movement') {
      drawResult = checkDraw(nextHistory, nextMovesSinceCapture)
    }
    if (drawResult) {
      setBoard(resetBoard)
      setIsDraw(true)
      setDrawReason(drawResult)
      return
    }

    setBoard(resetBoard)
    setCurrentPlayer(nextPlayer)
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
    setGameMode(null)
    setDifficulty('medium')
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
    setWinningSquares([])
    setIsDraw(false)
    setDrawReason(null)
    setBoardHistory([])
    setMovesSinceCapture(0)
    setShowEndGame(false)
    setMoveHistory([])
    setHistory([])
    setForcedBlockSquare(null)
    setStatusMessage('')
    setAiPlayer(null)
    setHumanPlayer(null)
  }

  const recordMove = (move) => {
    setMoveHistory((prev) => [
      ...prev,
      {
        ...move,
        moveNumber: prev.length + 1,
      },
    ])
  }

  const handleStartGame = ({
    mode,
    playerColor,
    difficulty: selectedDifficulty,
  }) => {
    setGameMode(mode)
    if (mode === 'ai') {
      setHumanPlayer(playerColor)
      setAiPlayer(playerColor === 'white' ? 'black' : 'white')
    } else if (mode === 'training') {
      setHumanPlayer('white')
      setAiPlayer('black')
    }
    if (selectedDifficulty) {
      setDifficulty(selectedDifficulty)
    }
    setGameStarted(true)
  }

  const handleUndo = () => {
    if (gameMode !== 'training') return
    setHistory((prev) => {
      if (prev.length === 0) return prev
      const previousState = prev[prev.length - 1]
      setBoard(cloneBoardState(previousState.board))
      setCurrentPlayer(previousState.currentPlayer)
      setRemainingPieces(clonePiecesState(previousState.remainingPieces))
      setCapturedPieces(clonePiecesState(previousState.capturedPieces))
      setPiecesPlaced(clonePiecesState(previousState.piecesPlaced))
      setPhase(previousState.phase)
      setMoveHistory(cloneMoveHistory(previousState.moveHistory))
      setBoardHistory([...(previousState.boardHistory ?? [])])
      setMovesSinceCapture(previousState.movesSinceCapture ?? 0)
      setSelectedPiece(null)
      setSelectedMovePiece(null)
      setValidMoves([])
      setWinner(null)
      setWinningSquares([])
      setIsDraw(false)
      setDrawReason(null)
      setShowEndGame(false)
      setForcedBlockSquare(previousState.forcedBlockSquare ?? null)
      setStatusMessage(previousState.statusMessage ?? '')
      return prev.slice(0, -1)
    })
  }

  const isAiMode = gameMode === 'ai' || gameMode === 'training'

  const handleSelectPiece = (pieceType) => {
    if (winner || isDraw) return
    if (isAiMode && aiPlayer && currentPlayer === aiPlayer) return
    if (phase === 'movement' && remainingPieces[currentPlayer].length === 0) {
      return
    }
    if (!remainingPieces[currentPlayer].includes(pieceType)) return
    playSound('click', isMuted)
    setSelectedPiece(pieceType)
    setSelectedMovePiece(null)
    setValidMoves([])
  }

  const placePieceAt = (pieceType, player, targetRow, targetCol) => {
    pushHistorySnapshot()
    const nextBoard = board.map((boardRow) => boardRow.slice())
    nextBoard[targetRow][targetCol] = createPiece(pieceType, player, targetRow)
    const nextPlayerPieces = [...remainingPieces[player]]
    const pieceIndex = nextPlayerPieces.indexOf(pieceType)
    if (pieceIndex !== -1) {
      nextPlayerPieces.splice(pieceIndex, 1)
    }

    setRemainingPieces((prev) => {
      const updatedPieces = [...prev[player]]
      const updatedIndex = updatedPieces.indexOf(pieceType)
      if (updatedIndex !== -1) {
        updatedPieces.splice(updatedIndex, 1)
      }
      return {
        ...prev,
        [player]: updatedPieces,
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
    playSound('place', isMuted)
    recordMove({
      player,
      type: 'place',
      piece: pieceType,
      from: null,
      to: { row: targetRow, col: targetCol },
      captured: null,
    })

    const nextPlayer = player === 'white' ? 'black' : 'white'
    const opponentCanPlace = remainingPieces[nextPlayer].length > 0

    if (phase === 'placement' && nextPlayerPieces.length > 0 && opponentCanPlace) {
      const threats = findThreats(nextBoard, player)
      const blockingResult =
        threats.length > 0 ? getBlockingSquare(nextBoard, nextPlayer) : null

      if (blockingResult === 'unblockable') {
        setBoard(nextBoard)
        setWinner(player)
        setWinningSquares([])
        setShowEndGame(true)
        setForcedBlockSquare(null)
        setStatusMessage(`Unblockable threat! ${formatName(player)} wins!`)
        return
      }

      if (blockingResult) {
        setForcedBlockSquare(blockingResult)
        setStatusMessage('')
      } else {
        setForcedBlockSquare(null)
        setStatusMessage('')
      }
    } else {
      setForcedBlockSquare(null)
      setStatusMessage('')
    }

    finalizeTurn(nextBoard, false)
  }

  const handleSquareClick = (row, col) => {
    if (winner || isDraw) return
    if (isAiMode && aiPlayer && currentPlayer === aiPlayer) return

    const clickedPiece = board[row][col]
    const isOwnPiece = clickedPiece && clickedPiece.player === currentPlayer
    const isEmpty = !clickedPiece
    const canPlacePiece =
      selectedPiece && remainingPieces[currentPlayer].length > 0

    if (phase === 'placement') {
      if (!canPlacePiece || !isEmpty) return
      if (
        forcedBlockSquare &&
        (forcedBlockSquare.row !== row || forcedBlockSquare.col !== col)
      ) {
        return
      }
      if (
        forcedBlockSquare &&
        forcedBlockSquare.row === row &&
        forcedBlockSquare.col === col
      ) {
        setForcedBlockSquare(null)
      }
      placePieceAt(selectedPiece, currentPlayer, row, col)
      return
    }

    if (selectedMovePiece) {
      const isValidDestination = validMoves.some(
        (move) => move.row === row && move.col === col
      )
      if (isValidDestination) {
        pushHistorySnapshot()
        const movingPiece = { ...selectedMovePiece.piece }
        const capturedPiece = clickedPiece
        const wasCapture =
          capturedPiece && capturedPiece.player !== currentPlayer

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

        if (movingPiece.type === 'bishop') {
          const deltaRow = row - selectedMovePiece.row
          const deltaCol = col - selectedMovePiece.col
          const isOrthogonal = deltaRow === 0 || deltaCol === 0
          if (isOrthogonal) {
            movingPiece.hasUsedOrthogonal = true
          }
        }

        const nextBoard = board.map((boardRow) => boardRow.slice())
        nextBoard[selectedMovePiece.row][selectedMovePiece.col] = null
        nextBoard[row][col] = movingPiece
        applyCapture(capturedPiece)
        recordMove({
          player: currentPlayer,
          type: wasCapture ? 'capture' : 'move',
          piece: movingPiece.type,
          from: { row: selectedMovePiece.row, col: selectedMovePiece.col },
          to: { row, col },
          captured: wasCapture ? capturedPiece.type : null,
        })

        playSound(wasCapture ? 'capture' : 'move', isMuted)
        finalizeTurn(nextBoard, wasCapture)
        return
      }
    }

    if (isOwnPiece) {
      if (
        selectedMovePiece &&
        selectedMovePiece.row === row &&
        selectedMovePiece.col === col
      ) {
        setSelectedPiece(null)
        setSelectedMovePiece(null)
        setValidMoves([])
        return
      }
      setSelectedPiece(null)
      setSelectedMovePiece({ row, col, piece: clickedPiece })
      setValidMoves(getValidMoves(board, row, col, clickedPiece))
      return
    }

    if (isEmpty && canPlacePiece && !selectedMovePiece) {
      placePieceAt(selectedPiece, currentPlayer, row, col)
      return
    }

    setSelectedMovePiece(null)
    setValidMoves([])
  }

  const canPlace =
    !winner &&
    !isDraw &&
    selectedPiece &&
    remainingPieces[currentPlayer].length > 0
  const infoMessage =
    statusMessage ||
    (remainingPieces[currentPlayer].length > 0
      ? 'Place a piece or move one of yours.'
      : '')

  const handleEndGameHowToPlay = () => {
    setShowEndGame(false)
    setShowTutorial(true)
  }

  useEffect(() => {
    if (!gameStarted) return undefined
    if (!isAiMode) return undefined
    if (!aiPlayer) return undefined
    if (currentPlayer !== aiPlayer) return undefined
    if (winner || isDraw) return undefined

    const timeoutId = setTimeout(() => {
      try {
        if (isDev) {
          console.log('[AI] turn detected', {
            phase,
            currentPlayer,
            remainingAi: remainingPieces[aiPlayer]?.length ?? 0,
            forcedBlockSquare,
          })
        }

        if (
          phase === 'placement' &&
          forcedBlockSquare &&
          remainingPieces[aiPlayer].length > 0
        ) {
          const forcedPiece = remainingPieces[aiPlayer][0]
          if (isDev) {
            console.log('[AI] forced block placement', {
              piece: forcedPiece,
              row: forcedBlockSquare.row,
              col: forcedBlockSquare.col,
            })
          }
          placePieceAt(
            forcedPiece,
            aiPlayer,
            forcedBlockSquare.row,
            forcedBlockSquare.col
          )
          return
        }

        const aiMove = getAIMove(
          board,
          remainingPieces,
          phase,
          difficulty,
          aiPlayer
        )
        if (isDev) {
          console.log('[AI] move decided', aiMove)
        }
        if (!aiMove) {
          if (isDev) {
            console.error('[AI] no move returned - declaring draw')
          }
          setIsDraw(true)
          setDrawReason('stalemate')
          return
        }
        if (aiMove.type === 'place') {
          const { piece, row, col } = aiMove
          if (board[row][col]) {
            if (isDev) {
              console.error('[AI] invalid place target occupied', { row, col })
            }
            return
          }
          placePieceAt(piece, aiPlayer, row, col)
          if (isDev) {
            console.log('[AI] place applied', { piece, row, col })
          }
          return
        }

        if (aiMove.type === 'move') {
          const { fromRow, fromCol, toRow, toCol } = aiMove
          const movingPiece = board[fromRow]?.[fromCol]
          if (!movingPiece) {
            if (isDev) {
              console.error('[AI] invalid move: missing piece', {
                fromRow,
                fromCol,
              })
            }
            return
          }
          pushHistorySnapshot()
          const nextMovingPiece = { ...movingPiece }
          const capturedPiece = board[toRow]?.[toCol] ?? null
          const wasCapture =
            capturedPiece && capturedPiece.player !== currentPlayer

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

          if (nextMovingPiece.type === 'bishop') {
            const deltaRow = toRow - fromRow
            const deltaCol = toCol - fromCol
            const isOrthogonal = deltaRow === 0 || deltaCol === 0
            if (isOrthogonal) {
              nextMovingPiece.hasUsedOrthogonal = true
            }
          }

          const nextBoard = board.map((boardRow) => boardRow.slice())
          nextBoard[fromRow][fromCol] = null
          nextBoard[toRow][toCol] = nextMovingPiece
          applyCapture(capturedPiece)
          recordMove({
            player: aiPlayer,
            type: wasCapture ? 'capture' : 'move',
            piece: nextMovingPiece.type,
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            captured: wasCapture ? capturedPiece.type : null,
          })
          playSound(wasCapture ? 'capture' : 'move', isMuted)
          finalizeTurn(nextBoard, wasCapture)
          if (isDev) {
            console.log('[AI] move applied', { fromRow, fromCol, toRow, toCol })
          }
        }
      } catch (error) {
        if (isDev) {
          console.error('[AI] turn error', error)
        }
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
    difficulty,
    winner,
    isMuted,
    forcedBlockSquare,
    aiPlayer,
  ])

  if (!gameStarted) {
    return <GameMenu onStart={handleStartGame} />
  }

  return (
    <div className="app" data-game-mode={gameMode}>
      <header className="app__header">
        <div>
          <h1 className="title">Tic-Tac-Toe Chess</h1>
        </div>
        <div className="header-actions">
          <div className="turn-banner">
            <span className="turn-banner__label">Current turn</span>
            <span className={`player-pill player-pill--${currentPlayer}`}>
              {formatName(currentPlayer)}
            </span>
          </div>
          <button
            type="button"
            className="reset-button"
            style={{
              background: 'transparent',
              borderColor: 'var(--panel-border)',
              color: 'var(--text-muted)',
              boxShadow: 'none',
            }}
            onClick={() => setShowTutorial(true)}
          >
            How to Play
          </button>
          <button
            type="button"
            className="reset-button reset-button--sound"
            onClick={() => setIsMuted((prev) => !prev)}
            aria-pressed={isMuted}
            aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
            title={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          {gameMode === 'training' ? (
            <button
              type="button"
              className="reset-button reset-button--undo"
              onClick={handleUndo}
              disabled={history.length === 0}
            >
              ↩ Undo
            </button>
          ) : null}
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
          winningSquares={winningSquares}
          forcedBlockSquare={forcedBlockSquare}
        />
        <EndGameModal
          isOpen={showEndGame}
          winner={winner}
          isDraw={isDraw}
          drawReason={drawReason}
          onPlayAgain={resetGame}
          onShowTutorial={handleEndGameHowToPlay}
        />
        <div className="sidebar">
          {gameMode === 'training' ? (
            <div className="training-badge">Training Mode</div>
          ) : null}
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
            drawReason={drawReason}
            moveHistory={moveHistory}
            setMoveHistory={setMoveHistory}
            infoMessage={infoMessage}
            totalPieces={INITIAL_PIECES.length}
            forcedBlockSquare={forcedBlockSquare}
          />
        </div>
      </main>
      <Tutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  )
}

export default App
