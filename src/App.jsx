import React, { useState, useEffect } from 'react';
import './App.css';

// --- LOGIC SUDOKU (TIDAK BERUBAH) ---
const getEmptyBoard = () => Array(81).fill(0);
const isSafe = (board, row, col, num) => {
  for (let x = 0; x < 9; x++) if (board[row * 9 + x] === num) return false;
  for (let x = 0; x < 9; x++) if (board[x * 9 + col] === num) return false;
  const sr = row - (row % 3), sc = col - (col % 3);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (board[(sr + i) * 9 + (sc + j)] === num) return false;
  return true;
};
const solve = (board) => {
  for (let i = 0; i < 81; i++) {
    if (board[i] === 0) {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
      for (let num of nums) {
        if (isSafe(board, Math.floor(i / 9), i % 9, num)) {
          board[i] = num;
          if (solve(board)) return true;
          board[i] = 0;
        }
      }
      return false;
    }
  }
  return true;
};
const generate = (level) => {
  const solved = getEmptyBoard();
  solve(solved);
  const initial = [...solved];
  let remove = level === 'Easy' ? 30 : level === 'Medium' ? 40 : 50;
  while (remove > 0) {
    let idx = Math.floor(Math.random() * 81);
    if (initial[idx] !== 0) { initial[idx] = 0; remove--; }
  }
  return { initial, solved };
};

const IMG_HERO = "/banner.png"; 
const IMG_LOGO = "/logo.png"; // Pastikan ada logo.png

const Footer = () => (
  <a href="https://www.instagram.com/rosaliasalsabila_/" target="_blank" rel="noreferrer" className="footer-link">
    by Rosalia Salsabila
  </a>
);

const StarIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#F1C40F" stroke="#F1C40F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

function App() {
  const [view, setView] = useState('splash'); 
  const [showLevelModal, setShowLevelModal] = useState(false);
  
  // Game State
  const [level, setLevel] = useState('Easy');
  const [initBoard, setInitBoard] = useState([]);
  const [board, setBoard] = useState([]);
  const [solved, setSolved] = useState([]);
  const [mistake, setMistake] = useState(0);
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState(3);
  const [hist, setHist] = useState([]);
  const [timer, setTimer] = useState(0);
  
  // Modal States
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  
  const [sel, setSel] = useState(null);

  // SPLASH SCREEN TIMER
  useEffect(() => {
    if (view === 'splash') {
      const t = setTimeout(() => setView('home'), 2800);
      return () => clearTimeout(t);
    }
  }, [view]);

  // Timer Logic
  useEffect(() => {
    let t;
    if (view === 'game' && !isPaused && !isGameOver && !isWin && !showLevelModal) {
      t = setInterval(() => setTimer(s => s + 1), 1000);
    }
    return () => clearInterval(t);
  }, [view, isPaused, isGameOver, isWin, showLevelModal]);

  const fmtTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const startGame = (lvl) => {
    const g = generate(lvl);
    setLevel(lvl); setInitBoard(g.initial); setBoard([...g.initial]); setSolved(g.solved);
    setMistake(0); setScore(0); setHints(3); setHist([]); setTimer(0);
    setIsPaused(false); setIsGameOver(false); setIsWin(false); setShowLevelModal(false); 
    setSel(null);
    setView('game');
  };

  const handleInput = (num) => {
    if (sel === null || isGameOver || isWin || board[sel] !== 0) return;
    if (solved[sel] === num) {
      const nb = [...board]; nb[sel] = num;
      setBoard(nb); setHist([...hist, { i: sel, v: 0 }]);
      setScore(s => s + 100);
      if (!nb.includes(0)) setIsWin(true);
    } else {
      const nb = [...board]; nb[sel] = num;
      setBoard(nb); setHist([...hist, { i: sel, v: 0 }]);
      setMistake(m => {
        const newM = m + 1;
        if (newM >= 5) setIsGameOver(true);
        return newM;
      });
    }
  };

  const undo = () => {
    if (!hist.length || isGameOver || isWin) return;
    const last = hist.pop();
    const nb = [...board]; nb[last.i] = 0;
    setBoard(nb); setHist([...hist]); 
  };

  const hint = () => {
    if (hints <= 0 || isGameOver || isWin || sel === null || board[sel] !== 0) return;
    const nb = [...board]; nb[sel] = solved[sel];
    setBoard(nb); setHints(h => h - 1);
  };

  const getCellClass = (i) => {
    let classes = "cell ";
    if (initBoard[i] !== 0) classes += "c-initial "; else classes += "c-user ";
    if (sel === i) classes += "c-selected ";
    if (sel !== null && sel !== i) {
        const row = Math.floor(i / 9), col = i % 9;
        const sRow = Math.floor(sel / 9), sCol = sel % 9;
        if (row === sRow || col === sCol) classes += "c-highlight ";
        if (board[i] !== 0 && board[i] === board[sel]) classes += "c-same ";
    }
    if (board[i] !== 0 && board[i] !== solved[i]) classes += "c-err ";
    return classes;
  };

  // --- RENDER SPLASH ---
  if (view === 'splash') return (
    <div className="splash-container">
      <img src={IMG_LOGO} alt="Logo" className="splash-logo-animated" />
    </div>
  );

  // --- RENDER HOME ---
  if (view === 'home') return (
    <div className="main-container home-layout">
      <h1 className="home-title">SUDOKUTIME</h1>
      <div className="hero-box">
        <img src={IMG_HERO} alt="Banner" className="hero-img" onError={(e) => e.target.style.display='none'} />
      </div>
      <button className="btn-primary play-btn-large" onClick={() => setShowLevelModal(true)}>Play</button>
      
      {showLevelModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 className="modal-title">Select Level</h2>
            <div className="modal-btn-group">
              <button className="btn-primary modal-btn" onClick={() => startGame('Easy')}>Easy</button>
              <button className="btn-primary modal-btn" onClick={() => startGame('Medium')}>Medium</button>
              <button className="btn-primary modal-btn" onClick={() => startGame('Hard')}>Hard</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );

  // --- RENDER GAME (STRUKTUR BARU) ---
  return (
    <div className="main-container game-layout">
      
      {/* 1. TOP BAR: Hanya Tombol Back */}
      <div className="top-bar">
        <button className="icon-btn back-btn" onClick={() => setIsPaused(true)}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10c3 3 3 9 3 9"/></svg>
        </button>
      </div>

      {/* 2. GAME CONTENT WRAPPER (Untuk Layout Desktop Kiri-Kanan) */}
      <div className="game-content-wrapper">
        
        {/* KIRI: AREA PAPAN */}
        <div className="board-section">
            {/* Header Info (Level & Score) */}
            <div className="info-header">
                <h2 className="level-label">{level}</h2>
                <div className="score-label">Skors : {score}</div>
            </div>

            {/* Info Bar (Mistake & Time) -> DI ATAS BOARD */}
            <div className="status-bar">
                <span>Mistake: {mistake}/5</span>
                <span className="timer-text">{fmtTime(timer)}</span>
            </div>

            {/* Grid Sudoku */}
            <div className="board-wrapper">
                <div className="grid">
                {board.map((val, idx) => (
                    <div key={idx} className={getCellClass(idx)} onClick={() => !isGameOver && !isWin && !isPaused && setSel(idx)}>
                    {val !== 0 ? val : ''}
                    </div>
                ))}
                </div>
            </div>
        </div>

        {/* KANAN: AREA KONTROL (Di Desktop pindah ke samping, Di HP di bawah) */}
        <div className="controls-section">
            <div className="tools">
                <button className="tool-btn" onClick={undo} style={{opacity: hist.length ? 1 : 0.5}}>
                    <div className="tool-icon">↺</div>
                    <span>Cancel</span>
                </button>
                <button className="tool-btn" onClick={hint}>
                    <div className="tool-icon" style={{position:'relative'}}>
                        💡 <span className="badge">{hints}</span>
                    </div>
                    <span>Hint</span>
                </button>
            </div>
            
            <div className="numpad">
                {[1,2,3,4,5,6,7,8,9].map(n => (
                    <button key={n} className="num-btn" onClick={() => handleInput(n)}>{n}</button>
                ))}
            </div>
        </div>

      </div> {/* End Game Content Wrapper */}
      
      <Footer />

      {/* --- MODALS --- */}
      {isPaused && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 className="modal-title">Paused</h2>
            <p className="modal-desc">are you sure you want to quit?</p>
            <div className="modal-btn-group">
                <button className="btn-primary modal-btn" onClick={() => { setIsPaused(false); setView('home'); }}>Yes</button>
                <button className="btn-primary modal-btn" onClick={() => setIsPaused(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="modal-overlay">
          <div className="modal-card error-border">
            <h2 className="modal-title" style={{fontSize: '2rem'}}>Game Over</h2>
            <p className="modal-desc">You lost because you made 5 mistakes.</p>
            <div className="modal-btn-group">
                <button className="btn-primary modal-btn" onClick={() => setView('home')}>Home</button>
                <button className="btn-primary modal-btn" onClick={() => setShowLevelModal(true)}>New Game</button>
            </div>
          </div>
        </div>
      )}

      {isWin && (
        <div className="modal-overlay">
            <div className="win-card-container">
                <div className="win-card-header">
                    <div className="stars-container">
                        <StarIcon /><StarIcon /><StarIcon />
                    </div>
                    <h2 className="win-title">Congrats!!!</h2>
                    <div className="win-stats">
                        <div className="stat-row"><span>Level</span><span>{level}</span></div>
                        <div className="stat-row"><span>Times</span><span>{fmtTime(timer)}</span></div>
                        <div className="stat-row"><span>Skors</span><span>{score}</span></div>
                    </div>
                </div>
                <div className="win-buttons">
                    <button className="btn-primary modal-btn" onClick={() => setShowLevelModal(true)}>New Game</button>
                    <button className="btn-primary modal-btn" onClick={() => setView('home')}>Home</button>
                </div>
            </div>
        </div>
      )}

      {showLevelModal && (
        <div className="modal-overlay" style={{zIndex: 200}}>
          <div className="modal-card">
            <h2 className="modal-title">Select Level</h2>
            <div className="modal-btn-group">
              <button className="btn-primary modal-btn" onClick={() => startGame('Easy')}>Easy</button>
              <button className="btn-primary modal-btn" onClick={() => startGame('Medium')}>Medium</button>
              <button className="btn-primary modal-btn" onClick={() => startGame('Hard')}>Hard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;