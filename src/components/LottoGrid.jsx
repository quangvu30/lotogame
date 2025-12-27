import { useState, useEffect } from "react";
import { generateMatrix9x9 } from "../utils/generator";
import "./LottoGrid.css";

export default function LottoGrid({ onBack, playerName, ws }) {
  const [grid, setGrid] = useState(generateMatrix9x9(playerName));
  const [marked, setMarked] = useState(new Set());
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);

  // Listen for reset messages from admin
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "reset") {
          // Regenerate grid and clear marked cells
          setGrid(generateMatrix9x9(playerName));
          setMarked(new Set());
          setDrawnNumbers([]);
          setCurrentNumber(null);
        } else if (message.type === "pick_number") {
          // Admin picked a number
          const pickedNumber = message.data;
          setCurrentNumber(pickedNumber);
          setDrawnNumbers((prev) => [...prev, pickedNumber]);
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws, playerName]);

  const handleGenerateNewGrid = () => {
    setGrid(generateMatrix9x9(playerName));
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

  return (
    <div className="lotto-container">
      <div className="header-controls">
        {onBack && (
          <button className="back-button" onClick={onBack} title="Quay lại">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1>Lô Tô Show</h1>
        {playerName && (
          <div className="player-name">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>{playerName}</span>
          </div>
        )}
      </div>

      {/* Drawn Numbers */}
      {drawnNumbers.length > 0 && (
        <div className="drawn-numbers-section">
          <div className="drawn-numbers-list">
            {drawnNumbers.map((num, idx) => (
              <div
                key={idx}
                className={`drawn-number-circle ${
                  idx === drawnNumbers.length - 1 ? "latest" : ""
                }`}
              >
                {num}
              </div>
            ))}
          </div>
        </div>
      )}

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
                      <span className="mark">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      {showGenerateButton && (
        <button onClick={handleGenerateNewGrid}>Lấy phiếu mới</button>
      )}
    </div>
  );
}
