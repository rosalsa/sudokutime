// src/sudokuUtils.js

// Membuat papan kosong
const BLANK = 0;

export const getEmptyBoard = () => Array(81).fill(BLANK);

// Cek apakah angka aman ditaruh di posisi tersebut
const isSafe = (board, row, col, num) => {
  // Cek baris
  for (let x = 0; x < 9; x++) {
    if (board[row * 9 + x] === num) return false;
  }
  // Cek kolom
  for (let x = 0; x < 9; x++) {
    if (board[x * 9 + col] === num) return false;
  }
  // Cek kotak 3x3
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[(startRow + i) * 9 + (startCol + j)] === num) return false;
    }
  }
  return true;
};

// Algoritma Backtracking untuk generate solusi
const solveSudoku = (board) => {
  for (let i = 0; i < 81; i++) {
    if (board[i] === BLANK) {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5); // Random biar tidak pola
      for (let num of nums) {
        const row = Math.floor(i / 9);
        const col = i % 9;
        if (isSafe(board, row, col, num)) {
          board[i] = num;
          if (solveSudoku(board)) return true;
          board[i] = BLANK;
        }
      }
      return false;
    }
  }
  return true;
};

// Generate game baru
export const generateGame = (difficulty) => {
  // 1. Buat full solved board
  const solvedBoard = getEmptyBoard();
  solveSudoku(solvedBoard);

  // 2. Hapus angka berdasarkan kesulitan
  // Easy: hapus 30, Medium: 40, Hard: 50 (estimasi)
  let attempts = difficulty === 'Easy' ? 30 : difficulty === 'Medium' ? 45 : 55;
  
  const initialBoard = [...solvedBoard];
  while (attempts > 0) {
    let idx = Math.floor(Math.random() * 81);
    if (initialBoard[idx] !== BLANK) {
      initialBoard[idx] = BLANK;
      attempts--;
    }
  }

  return { initial: initialBoard, solved: solvedBoard };
};