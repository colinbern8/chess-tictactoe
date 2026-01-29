import Square from './Square'

const Board = ({
  board,
  onSquareClick,
  canPlace,
  selectedSquare,
  validMoves,
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

          return (
            <Square
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              piece={piece}
              onClick={() => onSquareClick(rowIndex, colIndex)}
              canPlace={canPlace && !piece}
              isSelected={isSelected}
              isValidMove={isValidMove}
            />
          )
        })
      )}
    </div>
  )
}

export default Board
