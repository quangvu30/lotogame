import { useState, useEffect } from "react";
import { getRandomEmoji } from "../utils/generator";
import "./AdminPage.css";

const NUMBERS = Array.from({ length: 90 }, (_, i) => i + 1);

export default function AdminPage({ onBack, onLogout, adminToken }) {
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" or "manual"
  const [currentNumber, setCurrentNumber] = useState(null);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [usedNumbers, setUsedNumbers] = useState(new Set());
  const [connectedClients, setConnectedClients] = useState([]);
  const [ws, setWs] = useState(null);
  const [clientAvatars, setClientAvatars] = useState(new Map()); // Store avatars by clientId

  useEffect(() => {
    if (!adminToken) return;

    // Connect to WebSocket with admin token as clientName
    const websocket = new WebSocket(
      `wss://lotows.photaichinh.org?clientName=${encodeURIComponent(
        adminToken
      )}`
    );

    let pingInterval;

    websocket.onopen = () => {
      console.log("Admin WebSocket connected");
      setWs(websocket);

      // Start sending ping every 5 seconds
      pingInterval = setInterval(() => {
        if (websocket.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify({ type: "ping" }));
        }
      }, 15000);
    };

    websocket.onerror = (error) => {
      console.error("Admin WebSocket error:", error);
    };

    websocket.onclose = () => {
      console.log("Admin WebSocket disconnected");
      setWs(null);
      if (pingInterval) {
        clearInterval(pingInterval);
      }
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Message from server:", message);

        if (message.type === "count_users_online") {
          // Map server data to client state
          const clients = message.data.users.map((user) => {
            // Preserve emoji for existing clients, generate new for new clients
            let avatar;
            setClientAvatars((prev) => {
              if (prev.has(user.clientId)) {
                avatar = prev.get(user.clientId);
                return prev;
              } else {
                avatar = getRandomEmoji();
                const newMap = new Map(prev);
                newMap.set(user.clientId, avatar);
                return newMap;
              }
            });

            return {
              id: user.clientId,
              name: user.clientName,
              avatar: avatar,
              connectedAt: new Date(user.connectedAt),
              status: "online",
            };
          });
          setConnectedClients(clients);
        } else if (message.type === "user_connected") {
          // Add new user to the list
          let newAvatar = getRandomEmoji();

          setClientAvatars((prev) => {
            if (!prev.has(message.clientId)) {
              const newMap = new Map(prev);
              newMap.set(message.clientId, newAvatar);
              return newMap;
            } else {
              newAvatar = prev.get(message.clientId);
              return prev;
            }
          });

          setConnectedClients((prev) => {
            // Check if user already exists
            if (prev.some((client) => client.id === message.clientId)) {
              return prev;
            }

            // Add new client
            return [
              ...prev,
              {
                id: message.clientId,
                name: message.clientName,
                avatar: newAvatar,
                connectedAt: new Date(message.timestamp),
                status: "online",
              },
            ];
          });
        } else if (message.type === "user_disconnected") {
          // Remove disconnected user from the list
          setConnectedClients((prev) =>
            prev.filter((client) => client.id !== message.clientId)
          );

          // Optionally keep the avatar in case they reconnect
          // Or remove it completely:
          // setClientAvatars((prev) => {
          //   const newMap = new Map(prev);
          //   newMap.delete(message.clientId);
          //   return newMap;
          // });
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    // Cleanup on unmount
    return () => {
      if (pingInterval) {
        clearInterval(pingInterval);
      }
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [adminToken]);

  const handleLogout = () => {
    // Close WebSocket connection on logout
    if (ws) {
      ws.close();
      setWs(null);
    }
    onLogout();
  };

  const resetDrum = () => {
    setCurrentNumber(null);
    setDrawnNumbers([]);
    setUsedNumbers(new Set());

    // Send reset message to server to broadcast to all clients
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "reset" }));
    }
  };

  const undoLastNumber = () => {
    if (drawnNumbers.length === 0) return;

    const lastNumber = drawnNumbers[drawnNumbers.length - 1];
    const newDrawnNumbers = drawnNumbers.slice(0, -1);
    setDrawnNumbers(newDrawnNumbers);
    setCurrentNumber(
      newDrawnNumbers.length > 0
        ? newDrawnNumbers[newDrawnNumbers.length - 1]
        : null
    );

    // If this was the last occurrence of this number, remove from used
    if (!newDrawnNumbers.includes(lastNumber)) {
      const newUsedNumbers = new Set(usedNumbers);
      newUsedNumbers.delete(lastNumber);
      setUsedNumbers(newUsedNumbers);
    }
  };

  const handleManualDraw = (num) => {
    setCurrentNumber(num);
    setDrawnNumbers([...drawnNumbers, num]);
    if (!usedNumbers.has(num)) {
      setUsedNumbers(new Set([...usedNumbers, num]));
    }

    // Broadcast picked number to all clients
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "pick_number",
          data: num,
        })
      );
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
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
        <h1>Quản Lý - Lô Tô Show</h1>
        <button
          className="logout-button"
          onClick={handleLogout}
          title="Đăng xuất"
        >
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`tab ${activeTab === "manual" ? "active" : ""}`}
          onClick={() => setActiveTab("manual")}
        >
          Chọn Số Thủ Công
        </button>
      </div>

      <div className="admin-container">
        {activeTab === "dashboard" ? (
          <>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>Tổng Số Người Chơi</h3>
                  <p className="stat-value">{connectedClients.length}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon active">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>Đang Hoạt Động</h3>
                  <p className="stat-value">
                    {
                      connectedClients.filter((c) => c.status === "online")
                        .length
                    }
                  </p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon drawn">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect
                      x="2"
                      y="7"
                      width="20"
                      height="14"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>Số Đã Rút</h3>
                  <p className="stat-value">{drawnNumbers.length}</p>
                </div>
              </div>
            </div>

            <div className="clients-section">
              <div className="section-header">
                <h2>Danh Sách Người Chơi</h2>
                <span className="client-count">
                  {connectedClients.length} người chơi
                </span>
              </div>
              <div className="clients-list">
                {connectedClients.map((client) => (
                  <div key={client.id} className="client-card">
                    <div className="client-avatar">
                      <span className="emoji-avatar">{client.avatar}</span>
                    </div>
                    <div className="client-info">
                      <h3>{client.name}</h3>
                      <p className="connection-time">
                        {formatTime(client.connectedAt)}
                      </p>
                    </div>
                    <div className={`client-status ${client.status}`}>
                      <span className="status-dot"></span>
                      {client.status === "online"
                        ? "Trực tuyến"
                        : "Ngoại tuyến"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-history">
              <h2>Lịch Sử Rút Thăm Gần Đây</h2>
              <div className="recent-draws">
                {drawnNumbers
                  .slice(-10)
                  .reverse()
                  .map((num, idx) => (
                    <div key={idx} className="recent-draw-item">
                      <span className="draw-number-badge">{num}</span>
                      <span className="draw-time">
                        Lượt {drawnNumbers.length - idx}
                      </span>
                    </div>
                  ))}
                {drawnNumbers.length === 0 && (
                  <p className="no-draws">Chưa có số nào được rút</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="manual-grid-section">
              <h2>Chọn Số (1-90)</h2>
              <div className="number-grid">
                {NUMBERS.map((num) => (
                  <button
                    key={num}
                    className={`number-button ${
                      usedNumbers.has(num) ? "used" : ""
                    } ${currentNumber === num ? "current" : ""}`}
                    onClick={() => handleManualDraw(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="manual-display-section">
              <div className="current-display">
                <h2>Số Hiện Tại</h2>
                <div className={`big-number ${currentNumber ? "show" : ""}`}>
                  {currentNumber || "-"}
                </div>
              </div>

              <div className="controls">
                <button
                  className="undo-button"
                  onClick={undoLastNumber}
                  disabled={drawnNumbers.length === 0}
                >
                  Hoàn Tác
                </button>
                <button className="reset-button" onClick={resetDrum}>
                  Đặt Lại
                </button>
              </div>

              <div className="history-section">
                <h2>Lịch Sử Rút Thăm ({drawnNumbers.length})</h2>
                <div className="history-list">
                  {drawnNumbers.map((num, idx) => (
                    <div key={idx} className="history-item">
                      <span className="draw-order">{idx + 1}</span>
                      <span className="draw-number">{num}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stats-section">
                <h2>Thống Kê</h2>
                <div className="stats">
                  <div className="stat">
                    <label>Tổng Số Rút:</label>
                    <span>{drawnNumbers.length}</span>
                  </div>
                  <div className="stat">
                    <label>Số Riêng Biệt:</label>
                    <span>{usedNumbers.size}</span>
                  </div>
                  <div className="stat">
                    <label>Còn Lại:</label>
                    <span>{90 - usedNumbers.size}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
