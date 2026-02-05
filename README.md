# Tic-Tac-Toe Chess

A strategic 4x4 board game combining elements of Tic-Tac-Toe and Chess. Place your pieces strategically, then move them with chess-like rules to align four in a row and win!

[🎮 Play Live Demo](#) <!-- Add your deployed URL here -->

![Game Screenshot](screenshot.png) <!-- Add a screenshot to your repo -->

---

## 🎯 Game Overview

**Objective:** Be the first player to align all 4 of your pieces in a row (horizontal, vertical, or diagonal).

**Game Modes:**
- **2 Players** - Local multiplayer on the same device
- **vs AI** - Play against computer opponent with 3 difficulty levels
- **Training Mode** - Practice with unlimited undo

---

## 🎮 How to Play

### Phase 1: Placement
Players alternate placing their 4 pieces (Rook, Knight, Bishop, Pawn) on any empty square of the 4x4 board.

### Phase 2: Movement
Once all pieces are placed, players take turns either:
- **Moving** an existing piece following chess rules
- **Placing** a captured piece back on the board

### Piece Movement
- **♖ Rook:** Moves any number of squares horizontally or vertically
- **♘ Knight:** Moves in an L-shape (2+1 squares), can jump over pieces
- **♗ Bishop:** Moves diagonally, OR can step 1 square orthogonally once per turn
- **♙ Pawn:** Moves 1 square forward, captures diagonally. Reverses direction at board edges.

### Special Rules
- **Capture & Rebirth:** Captured pieces return to the owner's hand and can be placed again
- **Forced Blocking:** If a player has 3 in a row during placement, opponent must block or lose
- **Movement-Only Win:** You can only win by MOVING a piece into 4-in-a-row, not by placing

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
# Clone the repository
git clone https://github.com/colinbern8/chess-tictactoe.git

# Navigate to project directory
cd chess-tictactoe

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + Vite
- **Styling:** Custom CSS with dark theme
- **State Management:** React Hooks
- **Audio:** Web Audio API (procedural sound generation)
- **Game Logic:** Pure JavaScript with modular architecture

---

## 📁 Project Structure
```
src/
├── components/          # React components
│   ├── Board.jsx       # Game board grid
│   ├── Square.jsx      # Individual square
│   ├── Piece.jsx       # Chess piece rendering
│   ├── GameInfo.jsx    # Sidebar with game state
│   ├── GameMenu.jsx    # Mode selection screen
│   ├── Tutorial.jsx    # How to play modal
│   ├── EndGameModal.jsx # Win/draw modal
│   └── MoveHistory.jsx # Move log
├── game/               # Core game logic
│   ├── pieceMovement.js    # Movement validation
│   ├── winCondition.js     # Win detection
│   ├── drawCondition.js    # Draw detection
│   ├── threatDetection.js  # Forced blocking logic
│   ├── aiOpponent.js       # AI implementation
│   └── soundManager.js     # Sound effects
└── App.jsx             # Main game controller
```

---

## 🎨 Features

- ✅ **Multiple Game Modes** - 2-player, vs AI, Training
- ✅ **Smart AI** - Easy, Medium, and Hard difficulties
- ✅ **Training Mode** - Undo moves to learn strategies
- ✅ **Sound Effects** - Procedural audio for game events
- ✅ **Move History** - Track all moves in the current game
- ✅ **Forced Blocking** - Strategic placement phase rules
- ✅ **Interactive Tutorial** - Learn how to play
- ✅ **Responsive Design** - Clean, modern UI
- ✅ **Dark Theme** - Easy on the eyes

---

## 🎯 Upcoming Features

- [ ] Online Multiplayer (WebSockets)
- [ ] User Accounts & Stats
- [ ] Matchmaking System
- [ ] Leaderboard
- [ ] Game Replay
- [ ] Mobile App (React Native)
- [ ] Custom Themes
- [ ] Tournament Mode

---

## 🧪 Testing

Manual testing checklist:

**2-Player Mode:**
- [ ] Place all 8 pieces → switches to movement phase
- [ ] Valid moves only
- [ ] Captures return pieces to opponent
- [ ] Win by movement triggers modal
- [ ] Reset clears everything

**AI Mode:**
- [ ] AI makes moves in both phases
- [ ] Easy/Medium/Hard feel different
- [ ] Game ends properly

**Training Mode:**
- [ ] Undo restores state correctly
- [ ] Undo button disables when history empty
- [ ] Can undo multiple times

---

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 Game Rules (Detailed)

### Win Conditions
- Align all 4 pieces in a row (horizontal, vertical, or diagonal)
- **Must win by moving a piece**, not by placing

### Draw Conditions
- **Threefold Repetition:** Same board position occurs 3 times
- **40-Move Rule:** 40 moves without a capture
- **Stalemate:** No legal moves available

### AI Behavior
- **Easy:** Random moves, beatable for beginners
- **Medium:** Defensive play, blocks threats, occasional captures
- **Hard:** Optimal strategy, evaluates all moves, plays to win

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

- GitHub: [@colinbern8](https://github.com/colinbern8)

---

## 🙏 Acknowledgments

- Chess piece icons: Unicode chess symbols
- Inspired by classic chess and tic-tac-toe
- Built with guidance from Claude AI

---

## 📸 Screenshots

### Game Board
![Game Board](screenshots/game-board.png)

### Tutorial
![Tutorial](screenshots/tutorial.png)

### Win Screen
![Win Screen](screenshots/win-screen.png)

---

**⭐ Star this repo if you enjoyed the game!**
