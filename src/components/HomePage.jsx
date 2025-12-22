import { useState } from "react";
import "./HomePage.css";
import LottoGrid from "./LottoGrid";

export default function HomePage() {
  const [showGame, setShowGame] = useState(false);
  const [showNameForm, setShowNameForm] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [ws, setWs] = useState(null);
  const [connectionError, setConnectionError] = useState("");

  const handlePlayClick = () => {
    setShowNameForm(true);
    setConnectionError("");
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      const name = nameInput.trim();
      setPlayerName(name);

      // Connect to WebSocket
      try {
        const websocket = new WebSocket(
          `ws://localhost:9001?clientName=${encodeURIComponent(name)}`
        );

        websocket.onopen = () => {
          console.log("WebSocket connected for:", name);
          setWs(websocket);
          setShowNameForm(false);
          setShowGame(true);
        };

        websocket.onerror = (error) => {
          console.error("WebSocket error:", error);
          setConnectionError(
            "Không thể kết nối đến máy chủ. Vui lòng thử lại."
          );
        };

        websocket.onclose = () => {
          console.log("WebSocket disconnected");
          setWs(null);
        };

        websocket.onmessage = (event) => {
          console.log("Message from server:", event.data);
          // Handle incoming messages here
        };
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        setConnectionError("Không thể kết nối đến máy chủ.");
      }
    }
  };

  const handleBack = () => {
    // Close WebSocket connection when going back
    if (ws) {
      ws.close();
      setWs(null);
    }
    setShowGame(false);
    setPlayerName("");
    setNameInput("");
  };

  if (showGame) {
    return <LottoGrid onBack={handleBack} playerName={playerName} ws={ws} />;
  }

  return (
    <div className="homepage">
      <div className="stars"></div>
      <div className="stars stars2"></div>

      <div className="content">
        <div className="header">
          <h1 className="title">LÔ TÔ SHOW</h1>
          <p className="subtitle">Trò Chơi Xổ Số Thú Vị & Hứa Hẹn</p>
        </div>

        <div className="features">
          <div className="feature">
            <div className="feature-icon">🎲</div>
            <h3>Phát Sốngẫu nhiên</h3>
            <p>Mỗi ô được lựa chọn ngẫu nhiên từ phạm vi riêng</p>
          </div>
          <div className="feature">
            <div className="feature-icon">✓</div>
            <h3>Đánh Dấu Số</h3>
            <p>Nhấp vào số để đánh dấu khi gọi số</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🎯</div>
            <h3>5x5 Ma Trận</h3>
            <p>Mỗi hàng và cột có đúng 5 số</p>
          </div>
        </div>

        <button className="play-button" onClick={handlePlayClick}>
          CHƠI NGAY
        </button>
        <div className="info">
          <p>Bộ xổ số lô tô hiện đại với giao diện dễ thương</p>
          <p>Thêm niềm vui vào cuộc sống hàng ngày của bạn</p>
        </div>
      </div>

      {showNameForm && (
        <div className="name-modal">
          <div className="name-modal-content">
            <h2>Chào mừng bạn!</h2>
            <p>Vui lòng nhập tên của bạn để bắt đầu</p>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                placeholder="Nhập tên của bạn..."
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
                maxLength={30}
              />
              {connectionError && (
                <div className="connection-error">{connectionError}</div>
              )}
              <div className="modal-buttons">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={!nameInput.trim()}
                >
                  Bắt Đầu
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowNameForm(false);
                    setConnectionError("");
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
