import { useState } from "react";
import { generateMatrix9x9 } from "../utils/generator";
import "./LottoGrid.css";

export default function LottoGrid() {
  const [grid, setGrid] = useState(generateMatrix9x9());
  const [marked, setMarked] = useState(new Set());

  const handleGenerateNewGrid = () => {
    setGrid(generateMatrix9x9());
    setMarked(new Set());
  };

  const handleCellClick = (rowIndex, colIndex) => {
    const key = `${rowIndex}-${colIndex}`;
    const newMarked = new Set(marked);

    if (newMarked.has(key)) {
      newMarked.delete(key);
    } else {
      newMarked.add(key);
    }
    setMarked(newMarked);
  };

  let test = true;
  // check hàng
  grid.forEach((r, i) => (test = r.filter((x) => x !== null).length === 5));

  // check cột
  for (let c = 0; c < 9; c++) {
    test = grid.map((r) => r[c]).filter((x) => x !== null).length === 5;
  }
  console.log("test", test);
  return (
    <div className="lotto-container">
      <h1>Lotto Grid</h1>
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell ${cell === null ? "empty" : "filled"}`}
                onClick={() =>
                  cell !== null && handleCellClick(rowIndex, colIndex)
                }
              >
                {cell !== null && (
                  <>
                    {cell}
                    {marked.has(`${rowIndex}-${colIndex}`) && (
                      <span className="mark">✕</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <button onClick={handleGenerateNewGrid}>Generate New Grid</button>
    </div>
  );
}
