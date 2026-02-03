const PIECE_NAMES = {
  rook: 'Rook',
  knight: 'Knight',
  bishop: 'Bishop',
  pawn: 'Pawn',
}

const PIECE_SYMBOLS = {
  white: {
    rook: '♖',
    knight: '♘',
    bishop: '♗',
    pawn: '♙',
  },
  black: {
    rook: '♜',
    knight: '♞',
    bishop: '♝',
    pawn: '♟',
  },
}

const Piece = ({ type, player, variant = 'board' }) => {
  const label = `${player} ${PIECE_NAMES[type] ?? type}`
  const symbol = PIECE_SYMBOLS[player]?.[type]
  const sizeClass = variant === 'hand' ? 'piece-icon--small' : ''

  return (
    <span
      className={`piece-icon piece-icon--${player} ${sizeClass}`.trim()}
      role="img"
      aria-label={label}
      title={label}
    >
      {symbol ?? ''}
    </span>
  )
}

export default Piece
