class SeededRandom {
  constructor(seed) {
    this.seed = seed; // Initial value
  }

  next() {
    // Linear Congruential Generator (LCG) formula
    // newSeed = (a * oldSeed + c) mod m
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280; // Normalize to 0-1
  }
}

export function generateMatrix9x9(clientId = null) {
  const SIZE = 9;
  const PER = 5;

  // Create a unique seed based on clientId
  let seed;
  if (clientId) {
    // Hash the entire clientId string to create a unique numeric seed
    let hash = 0;
    for (let i = 0; i < clientId.length; i++) {
      const char = clientId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Add a random component to ensure different matrices even for same clientId
    seed = Math.abs(hash) + Math.floor(Math.random() * 1000000);
  } else {
    seed = Date.now() + Math.floor(Math.random() * 1000000);
  }

  const rng = new SeededRandom(seed);

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function randomUnique(min, max, count) {
    const arr = [];
    while (arr.length < count) {
      const n = Math.floor(rng.next() * (max - min + 1)) + min;
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

  let temp = 0;
  for (let col = 0; col < SIZE; col++) {
    const rows = [];

    for (let row = 0; row < SIZE; row++) {
      if (mask[row][col] === 1) rows.push(row);
    }
    if (col > 0) temp = 1;
    const numbers = randomUnique(col * 10 + 1 - temp, col * 10 + 9, PER);

    rows.forEach((row, i) => {
      matrix[row][col] = numbers[i];
    });
  }

  return matrix;
}

export const getRandomEmoji = () => {
  const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🥸",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
    "😭",
    "😤",
    "😠",
    "😡",
    "🤬",
    "🤯",
    "😳",
    "🥵",
    "🥶",
    "😱",
    "😨",
    "😰",
    "😥",
    "😓",
    "🤗",
    "🤔",
    "🤭",
    "🤫",
    "🤥",
    "😶",
    "😐",
    "😑",
    "😬",
    "🙄",
    "😯",
    "😦",
    "😧",
    "😮",
    "😲",
    "🥱",
    "😴",
    "🤤",
    "😪",
    "😵",
    "🤐",
    "🥴",
    "🤢",
    "🤮",
    "🤧",
    "😷",
    "🤒",
    "🤕",
    "👍",
    "👎",
    "👏",
    "🙌",
    "🤝",
    "🙏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "🔥",
    "✨",
    "⭐",
    "🌟",
    "💥",
    "💫",
    "🎉",
    "🎊",
    "🎯",
    "🎮",
    "🎯",
    "🎲",
    "🎪",
    "🎨",
    "🎭",
    "🎬",
    "🎤",
    "🎧",
    "🎸",
    "🏆",
    "🥇",
    "🥈",
    "🥉",
    "⭐",
    "🌟",
    "💫",
    "✨",
    "🔥",
    "💎",
    "🦁",
    "🐯",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐸",
    "🦄",
    "🦋",
    "🐝",
  ];
  return emojis[Math.floor(Math.random() * emojis.length)];
};
