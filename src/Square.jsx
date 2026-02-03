import Piece from './Piece'

const formatName = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : ''

const Square = ({
  row,
  col,
  piece,
  onClick,
  canPlace,
  isSelected,
  isValidMove,
  isWinning,
  isForced,
  isBlocked,
}) => {
  const isDark = (row + col) % 2 === 1
  const classes = ['square', isDark ? 'square--dark' : 'square--light']

  if (canPlace) {
    classes.push('square--open')
  }
  if (isSelected) {
    classes.push('square--selected')
  }
  if (isValidMove) {
    classes.push('square--valid')
  }
  if (isWinning) {
    classes.push('square--winning')
  }
  if (isForced) {
    classes.push('square--forced')
  }
  if (isBlocked) {
    classes.push('square--blocked')
  }

  const pieceLabel = piece
    ? `${formatName(piece.player)} ${formatName(piece.type)}`
    : 'Empty square'

  return (
    <button
      type="button"
      className={classes.join(' ')}
      onClick={onClick}
      disabled={isBlocked}
      style={{ width: '100%', height: '100%', overflow: 'hidden' }}
      aria-label={`Row ${row + 1}, Column ${col + 1}: ${pieceLabel}`}
    >
      {piece ? <Piece type={piece.type} player={piece.player} /> : null}
    </button>
  )
}

export default Square
