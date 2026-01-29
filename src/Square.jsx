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

  const pieceLabel = piece
    ? `${formatName(piece.player)} ${formatName(piece.type)}`
    : 'Empty square'

  return (
    <button
      type="button"
      className={classes.join(' ')}
      onClick={onClick}
      aria-label={`Row ${row + 1}, Column ${col + 1}: ${pieceLabel}`}
    >
      {piece ? <Piece type={piece.type} player={piece.player} /> : null}
    </button>
  )
}

export default Square
