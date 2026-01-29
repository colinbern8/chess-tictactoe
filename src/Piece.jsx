const PIECE_SYMBOLS = {
  rook: 'R',
  knight: 'N',
  bishop: 'B',
  pawn: 'P',
}

const PIECE_NAMES = {
  rook: 'Rook',
  knight: 'Knight',
  bishop: 'Bishop',
  pawn: 'Pawn',
}

const Piece = ({ type, player, variant = 'board' }) => {
  const symbol = PIECE_SYMBOLS[type] ?? '?'
  const label = `${player} ${PIECE_NAMES[type] ?? type}`

  return (
    <div
      className={`piece piece--${player} piece--${variant}`}
      role="img"
      aria-label={label}
      title={label}
    >
      <span className="piece__symbol">{symbol}</span>
    </div>
  )
}

export default Piece
