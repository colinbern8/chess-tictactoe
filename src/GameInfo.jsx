import Piece from './Piece'
import MoveHistory from './components/MoveHistory'
import { INITIAL_PIECES, PLAYERS } from './game/gameConstants'

const formatName = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : ''

const PIECE_LABELS = {
  rook: 'Rook',
  knight: 'Knight',
  bishop: 'Bishop',
  pawn: 'Pawn',
}

const GameInfo = ({
  currentPlayer,
  phase,
  remainingPieces,
  capturedPieces,
  piecesPlaced,
  selectedPiece,
  onSelectPiece,
  winner,
  isDraw,
  drawReason,
  infoMessage,
  moveHistory,
  forcedBlockSquare,
}) => {
  const isPlacement = phase === 'placement'
  const canPlacePieces = remainingPieces[currentPlayer].length > 0

  const hasCapturedPieces =
    (capturedPieces?.white?.length ?? 0) > 0 ||
    (capturedPieces?.black?.length ?? 0) > 0

  const getVisiblePieces = (player) => {
    const placed = piecesPlaced?.[player] ?? []
    const captured = capturedPieces?.[player] ?? []
    return INITIAL_PIECES.filter(
      (pieceType) => placed.includes(pieceType) || captured.includes(pieceType)
    ).map((pieceType) => ({
      type: pieceType,
      isCaptured: captured.includes(pieceType),
    }))
  }

  const renderPlayerCard = (player) => {
    const piecesToShow = getVisiblePieces(player)
    return (
      <div
        className={`player-card ${
          currentPlayer === player ? 'player-card--active' : ''
        }`}
      >
        <div className="player-card__header">
          <span className={`player-card__name player-card__name--${player}`}>
            {formatName(player)}
          </span>
        </div>
        <div className="player-card__pieces">
          {piecesToShow.map((piece) => (
            <span
              key={`${player}-${piece.type}`}
              className={`player-card__piece ${
                piece.isCaptured ? 'player-card__piece--captured' : ''
              }`}
            >
              <Piece type={piece.type} player={player} variant="hand" />
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <aside className="game-info">
      <section className="info-section">
        <div className="player-cards-row">
          {renderPlayerCard(PLAYERS[0])}
          <span className="player-card__vs">vs</span>
          {renderPlayerCard(PLAYERS[1])}
        </div>
        <MoveHistory moves={moveHistory} />
        {isDraw ? (
          <div className="status-row">
            <span className="status-label">Result</span>
            <span className="phase-pill">
              {drawReason === 'threefold'
                ? 'Draw (threefold repetition)'
                : drawReason === '40move'
                  ? 'Draw (40 moves)'
                  : 'Draw'}
            </span>
          </div>
        ) : null}
        {infoMessage ? <p className="muted">{infoMessage}</p> : null}
      </section>

      {!winner && !isDraw && canPlacePieces ? (
        <section className="info-section">
          <div className="status-row status-row--stack">
            <span className="status-label">Select a piece to place</span>
            <span className="muted">
              {isPlacement
                ? 'Pick a piece, then choose a square.'
                : 'Place a piece or move one you own.'}
            </span>
          </div>
          {isPlacement && forcedBlockSquare ? (
            <div className="forced-warning">⚠️ You must block here!</div>
          ) : null}
          <div className="piece-options">
            {remainingPieces[currentPlayer].map((pieceType) => (
              <div key={`${currentPlayer}-${pieceType}`} className="piece-option">
                <button
                  type="button"
                  className={`piece-button ${
                    selectedPiece === pieceType ? 'piece-button--selected' : ''
                  }`}
                  onClick={() => onSelectPiece(pieceType)}
                >
                  <Piece type={pieceType} player={currentPlayer} variant="hand" />
                </button>
                <span className="piece-label">
                  {PIECE_LABELS[pieceType] ?? pieceType}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {hasCapturedPieces ? (
        <section className="info-section">
          <h3 className="section-title">Captured pieces</h3>
          <div className="player-list">
            {PLAYERS.filter(
              (player) => (capturedPieces?.[player]?.length ?? 0) > 0
            ).map((player) => {
              const playerCaptured = capturedPieces?.[player] ?? []
              return (
                <div key={`${player}-captured`} className="player-summary">
                  <div className="player-summary__header">
                    <span className={`player-pill player-pill--${player}`}>
                      {formatName(player)}
                    </span>
                  </div>
                  <div className="piece-list">
                    {playerCaptured.map((pieceType, index) => (
                      <Piece
                        key={`${player}-captured-${pieceType}-${index}`}
                        type={pieceType}
                        player={player}
                        variant="hand"
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}
    </aside>
  )
}

export default GameInfo
