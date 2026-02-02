import { useState } from 'react'
import './GameMenu.css'

function GameMenu({ onStart }) {
  const [mode, setMode] = useState('2player')
  const [playerColor, setPlayerColor] = useState('white')

  const handleSubmit = (event) => {
    event.preventDefault()
    onStart({ mode, playerColor })
  }

  return (
    <div className="game-menu">
      <div className="game-menu__panel">
        <header className="game-menu__header">
          <p className="game-menu__eyebrow">Tic-Tac-Toe Chess</p>
          <h1 className="game-menu__title">Choose your game</h1>
          <p className="game-menu__subtitle">
            Pick a mode and jump into the 4x4 tactical grid.
          </p>
        </header>
        <form className="game-menu__form" onSubmit={handleSubmit}>
          <div className="game-menu__section">
            <h2 className="game-menu__section-title">Game mode</h2>
            <div className="game-menu__options">
              <label className="game-menu__option">
                <input
                  type="radio"
                  name="game-mode"
                  value="2player"
                  checked={mode === '2player'}
                  onChange={() => setMode('2player')}
                />
                <span>2 Players</span>
              </label>
              <label className="game-menu__option">
                <input
                  type="radio"
                  name="game-mode"
                  value="ai"
                  checked={mode === 'ai'}
                  onChange={() => setMode('ai')}
                />
                <span>vs AI</span>
              </label>
            </div>
          </div>

          {mode === 'ai' && (
            <div className="game-menu__section">
              <h2 className="game-menu__section-title">Player color</h2>
              <div className="game-menu__options">
                <label className="game-menu__option">
                  <input
                    type="radio"
                    name="player-color"
                    value="white"
                    checked={playerColor === 'white'}
                    onChange={() => setPlayerColor('white')}
                  />
                  <span>Play as White</span>
                </label>
                <label className="game-menu__option">
                  <input
                    type="radio"
                    name="player-color"
                    value="black"
                    checked={playerColor === 'black'}
                    onChange={() => setPlayerColor('black')}
                  />
                  <span>Play as Black</span>
                </label>
              </div>
            </div>
          )}

          <button type="submit" className="game-menu__start">
            Start Game
          </button>
        </form>
      </div>
    </div>
  )
}

export default GameMenu
