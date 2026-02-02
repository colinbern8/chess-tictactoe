import rookWhite from './assets/rook-white.svg'
import rookBlack from './assets/rook-black.svg'
import knightWhite from './assets/knight-white.svg'
import knightBlack from './assets/knight-black.svg'
import bishopWhite from './assets/bishop-white.svg'
import bishopBlack from './assets/bishop-black.svg'
import pawnWhite from './assets/pawn-white.svg'
import pawnBlack from './assets/pawn-black.svg'

const PIECE_NAMES = {
  rook: 'Rook',
  knight: 'Knight',
  bishop: 'Bishop',
  pawn: 'Pawn',
}

const Piece = ({ type, player, variant = 'board' }) => {
  const label = `${player} ${PIECE_NAMES[type] ?? type}`
  const pieceImages = {
    white: {
      rook: rookWhite,
      knight: knightWhite,
      bishop: bishopWhite,
      pawn: pawnWhite,
    },
    black: {
      rook: rookBlack,
      knight: knightBlack,
      bishop: bishopBlack,
      pawn: pawnBlack,
    },
  }
  const imageSrc = pieceImages[player]?.[type]

  return (
    <div
      className={`piece piece--${player} piece--${variant}`}
      role="img"
      aria-label={label}
      title={label}
    >
      {imageSrc ? (
        <img className="piece__image" src={imageSrc} alt="" aria-hidden="true" />
      ) : null}
    </div>
  )
}

export default Piece
