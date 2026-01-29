import Piece from './Piece'

const PLAYERS = ['white', 'black']

const formatName = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : ''

const GameInfo = ({
  currentPlayer,
  phase,
  remainingPieces,
  capturedPieces,
  piecesPlaced,
  selectedPiece,
  onSelectPiece,
  winner,
  totalPieces,
}) => {
  const isPlacement = phase === 'placement'
  const canPlacePieces = remainingPieces[currentPlayer].length > 0

  return (
    <aside className="game-info">
      <section className="info-section">
        <h2 className="section-title">Game Status</h2>
        <div className="status-row">
          <span className="status-label">Current player</span>
          <span className={`player-pill player-pill--${currentPlayer}`}>
            {formatName(currentPlayer)}
          </span>
        </div>
        <div className="status-row">
          <span className="status-label">Phase</span>
          <span className="phase-pill">
            {isPlacement ? 'Placement' : 'Movement'}
          </span>
        </div>
        {winner ? (
          <div className="status-row">
            <span className="status-label">Winner</span>
            <span className={`player-pill player-pill--${winner}`}>
              {formatName(winner)}
            </span>
          </div>
        ) : null}
      </section>

      {!winner && canPlacePieces ? (
        <section className="info-section">
          <h3 className="section-title">Select a piece to place</h3>
          <p className="muted">
            {isPlacement
              ? 'Click a piece, then choose an empty square.'
              : 'Place a remaining piece or move one of your pieces.'}
          </p>
          {remainingPieces[currentPlayer].length ? (
            <div className="piece-options">
              {remainingPieces[currentPlayer].map((pieceType) => (
                <button
                  key={`${currentPlayer}-${pieceType}`}
                  type="button"
                  className={`piece-button ${
                    selectedPiece === pieceType ? 'piece-button--selected' : ''
                  }`}
                  onClick={() => onSelectPiece(pieceType)}
                >
                  <Piece
                    type={pieceType}
                    player={currentPlayer}
                    variant="hand"
                  />
                </button>
              ))}
            </div>
          ) : (
            <p className="muted">No pieces left to place.</p>
          )}
        </section>
      ) : null}

      <section className="info-section">
        <h3 className="section-title">Remaining pieces</h3>
        <div className="player-list">
          {PLAYERS.map((player) => (
            <div
              key={`${player}-remaining`}
              className={`player-summary ${
                player === currentPlayer ? 'player-summary--active' : ''
              }`}
            >
              <div className="player-summary__header">
                <span className={`player-pill player-pill--${player}`}>
                  {formatName(player)}
                </span>
                <span className="muted">
                  {piecesPlaced[player].length}/{totalPieces} placed
                </span>
              </div>
              <div className="piece-list">
                {remainingPieces[player].length ? (
                  remainingPieces[player].map((pieceType) => (
                    <Piece
                      key={`${player}-remaining-${pieceType}`}
                      type={pieceType}
                      player={player}
                      variant="hand"
                    />
                  ))
                ) : (
                  <span className="muted">None</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="info-section">
        <h3 className="section-title">Captured pieces</h3>
        <div className="player-list">
          {PLAYERS.map((player) => (
            <div key={`${player}-captured`} className="player-summary">
              <div className="player-summary__header">
                <span className={`player-pill player-pill--${player}`}>
                  {formatName(player)}
                </span>
              </div>
              <div className="piece-list">
                {capturedPieces[player].length ? (
                  capturedPieces[player].map((pieceType, index) => (
                    <Piece
                      key={`${player}-captured-${pieceType}-${index}`}
                      type={pieceType}
                      player={player}
                      variant="hand"
                    />
                  ))
                ) : (
                  <span className="muted">None</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  )
}

export default GameInfo
