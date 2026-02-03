import { useEffect, useRef } from 'react'
import './MoveHistory.css'

const PIECE_ICONS = {
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

const getPieceIcon = (player, piece) => PIECE_ICONS[player]?.[piece] ?? ''

const MoveHistory = ({ moves = [] }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [moves])

  return (
    <div className="move-history" ref={containerRef}>
      {moves.map((move, index) => {
        const isLatest = index === moves.length - 1
        const moverIcon = getPieceIcon(move.player, move.piece)
        const capturedPlayer = move.player === 'white' ? 'black' : 'white'
        const capturedIcon = move.captured
          ? getPieceIcon(capturedPlayer, move.captured)
          : ''

        let actionText = ''
        if (move.type === 'place') {
          actionText = `placed ${moverIcon} at (${move.to.row}, ${move.to.col})`
        } else if (move.type === 'move') {
          actionText = `moved ${moverIcon} to (${move.to.row}, ${move.to.col})`
        } else if (move.type === 'capture') {
          actionText = `${moverIcon} captured ${capturedIcon}!`
        }

        return (
          <div
            key={`${move.moveNumber}-${move.player}-${move.type}-${index}`}
            className={`move-entry ${isLatest ? 'move-entry--latest' : ''}`}
          >
            <span className="move-number">{move.moveNumber}.</span>
            <span className={`player-pill player-pill--${move.player} move-pill`}>
              {move.player === 'white' ? 'W' : 'B'}
            </span>
            <span className="move-piece">{moverIcon}</span>
            <span className="move-text">{actionText}</span>
          </div>
        )
      })}
    </div>
  )
}

export default MoveHistory
