const formatName = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : ''

const getDrawReasonText = (reason) => {
  if (reason === 'threefold') {
    return 'Same position occurred 3 times'
  }
  if (reason === '40move') {
    return '40 moves without a capture'
  }
  if (reason === 'stalemate') {
    return 'Stalemate - No Legal Moves!'
  }
  return ''
}

const EndGameModal = ({
  isOpen,
  winner,
  isDraw,
  drawReason,
  onPlayAgain,
  onShowTutorial,
}) => {
  if (!isOpen) {
    return null
  }

  const isWinner = Boolean(winner)
  const cardVariant = isWinner
    ? `end-game-card--${winner}`
    : isDraw
      ? 'end-game-card--draw'
      : ''

  return (
    <div className="end-game-overlay" role="dialog" aria-modal="true">
      <div className={`end-game-card ${cardVariant}`}>
        <button
          type="button"
          className="end-game-close"
          aria-label="Close"
          onClick={onPlayAgain}
        >
          ×
        </button>
        {isWinner ? (
          <>
            <div className="end-game-emoji">🏆</div>
            <h2 className="end-game-title">{formatName(winner)} Wins!</h2>
            <p className="end-game-subtitle">Congratulations on the victory!</p>
            <div className="end-game-buttons">
              <button
                type="button"
                className="end-game-btn-primary"
                onClick={onPlayAgain}
              >
                Play Again
              </button>
              <button
                type="button"
                className="end-game-btn-secondary"
                onClick={() => onShowTutorial?.(true)}
              >
                How to Play
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="end-game-emoji">🤝</div>
            <h2 className="end-game-title">It's a Draw!</h2>
            <p className="end-game-subtitle">{getDrawReasonText(drawReason)}</p>
            <div className="end-game-buttons">
              <button
                type="button"
                className="end-game-btn-primary"
                onClick={onPlayAgain}
              >
                Play Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default EndGameModal
