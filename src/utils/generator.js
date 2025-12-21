export function generateMatrix9x9() {
  const SIZE = 9;
  const PER = 5;

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function randomUnique(min, max, count) {
    const arr = [];
    while (arr.length < count) {
      const n = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!arr.includes(n)) arr.push(n);
    }
    return arr;
  }

  // ===== STEP 1: tạo mask hợp lệ =====
  let mask;

  while (true) {
    mask = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    const colCount = Array(SIZE).fill(0);

    let valid = true;

    for (let row = 0; row < SIZE; row++) {
      const cols = [];

      for (let col = 0; col < SIZE; col++) {
        if (colCount[col] < PER) cols.push(col);
      }

      if (cols.length < PER) {
        valid = false;
        break;
      }

      shuffle(cols);
      const selected = cols.slice(0, PER);

      selected.forEach((col) => {
        mask[row][col] = 1;
        colCount[col]++;
      });
    }

    // kiểm tra cột
    if (valid && colCount.every((c) => c === PER)) break;
  }

  // ===== STEP 2: gán số =====
  const matrix = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));

  for (let col = 0; col < SIZE; col++) {
    const rows = [];

    for (let row = 0; row < SIZE; row++) {
      if (mask[row][col] === 1) rows.push(row);
    }

    const numbers = randomUnique(col * 10 + 1, col * 10 + 9, PER);

    rows.forEach((row, i) => {
      matrix[row][col] = numbers[i];
    });
  }

  return matrix;
}
