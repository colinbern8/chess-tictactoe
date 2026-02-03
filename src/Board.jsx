import Square from './Square'

const Board = ({
  board,
  onSquareClick,
  canPlace,
  selectedSquare,
  validMoves,
  winningSquares,
  forcedBlockSquare,
}) => {
  return (
    <div className="board" role="grid" aria-label="Tic-Tac-Toe Chess board">
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const isSelected =
            selectedSquare &&
            selectedSquare.row === rowIndex &&
            selectedSquare.col === colIndex
          const isValidMove = validMoves.some(
            (move) => move.row === rowIndex && move.col === colIndex
          )
          const isWinning = winningSquares.some(
            (square) => square.row === rowIndex && square.col === colIndex
          )
          const isForced =
            forcedBlockSquare &&
            forcedBlockSquare.row === rowIndex &&
            forcedBlockSquare.col === colIndex
          const isBlocked = Boolean(forcedBlockSquare) && !piece && !isForced
          const canPlaceHere =
            canPlace && !piece && (!forcedBlockSquare || isForced)

          return (
            <Square
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              piece={piece}
              onClick={() => onSquareClick(rowIndex, colIndex)}
              canPlace={canPlaceHere}
              isSelected={isSelected}
              isValidMove={isValidMove}
              isWinning={isWinning}
              isForced={isForced}
              isBlocked={isBlocked}
            />
          )
        })
      )}
    </div>
  )
}

export default Board
