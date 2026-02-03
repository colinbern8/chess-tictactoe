import Piece from '../Piece'
import './Tutorial.css'

const Tutorial = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className="tutorial-overlay" role="dialog" aria-modal="true">
      <div className="tutorial-card">
        <header className="tutorial-header">
          <p className="tutorial-eyebrow">How to Play</p>
          <h2 className="tutorial-title">Tic-Tac-Toe Chess</h2>
          <p className="tutorial-subtitle">
            A quick guide to pieces, phases, and winning.
          </p>
        </header>

        <div className="tutorial-steps">
          <section className="tutorial-step">
            <div className="tutorial-step__number">1</div>
            <div className="tutorial-step__content">
              <h3 className="tutorial-step__title">Step 1 - The Goal</h3>
              <p className="tutorial-step__text">
                Get all 4 of your pieces in a row — horizontal,
                <br />
                vertical, or diagonal — to win!
              </p>
            </div>
          </section>

          <section className="tutorial-step">
            <div className="tutorial-step__number">2</div>
            <div className="tutorial-step__content">
              <h3 className="tutorial-step__title">Step 2 - Your Pieces</h3>
              <p className="tutorial-step__text">
                Each piece moves differently:
              </p>
              <div className="tutorial-piece-list">
                <div className="tutorial-piece">
                  <Piece type="rook" player="white" variant="hand" />
                  <div>
                    <p className="tutorial-piece__name">♖ Rook</p>
                    <p className="tutorial-piece__desc">
                      Moves any number of squares horizontally or vertically.
                    </p>
                  </div>
                </div>
                <div className="tutorial-piece">
                  <Piece type="knight" player="white" variant="hand" />
                  <div>
                    <p className="tutorial-piece__name">♘ Knight</p>
                    <p className="tutorial-piece__desc">
                      Moves in an L-shape, can jump over pieces.
                    </p>
                  </div>
                </div>
                <div className="tutorial-piece">
                  <Piece type="bishop" player="white" variant="hand" />
                  <div>
                    <p className="tutorial-piece__name">♗ Bishop</p>
                    <p className="tutorial-piece__desc">
                      Moves diagonally, can also step 1 square sideways once per
                      turn.
                    </p>
                  </div>
                </div>
                <div className="tutorial-piece">
                  <Piece type="pawn" player="white" variant="hand" />
                  <div>
                    <p className="tutorial-piece__name">♙ Pawn</p>
                    <p className="tutorial-piece__desc">
                      Moves forward 1 square, captures diagonally. Bounces back
                      at the edge.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="tutorial-step">
            <div className="tutorial-step__number">3</div>
            <div className="tutorial-step__content">
              <h3 className="tutorial-step__title">Step 3 - Placement Phase</h3>
              <p className="tutorial-step__text">
                Take turns placing your 4 pieces anywhere on the board.
                <br />
                No moving or capturing yet!
              </p>
            </div>
          </section>

          <section className="tutorial-step">
            <div className="tutorial-step__number">4</div>
            <div className="tutorial-step__content">
              <h3 className="tutorial-step__title">Step 4 - Movement Phase</h3>
              <p className="tutorial-step__text">
                Once all pieces are placed, take turns moving your pieces.
                <br />
                Capture opponent pieces by moving onto them.
              </p>
            </div>
          </section>

          <section className="tutorial-step">
            <div className="tutorial-step__number">5</div>
            <div className="tutorial-step__content">
              <h3 className="tutorial-step__title">Step 5 - Captured Pieces</h3>
              <p className="tutorial-step__text">
                Captured pieces come back! Your opponent can place
                <br />
                them again on a future turn.
              </p>
            </div>
          </section>

          <section className="tutorial-step">
            <div className="tutorial-step__number">6</div>
            <div className="tutorial-step__content">
              <h3 className="tutorial-step__title">Step 6 - Winning</h3>
              <p className="tutorial-step__text">
                You can only win by MOVING a piece into a 4-in-a-row.
                <br />
                Dropping a piece into position does not count!
              </p>
            </div>
          </section>
        </div>

        <button className="reset-button tutorial-close" onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  )
}

export default Tutorial
