import { useState } from "react";
import "./LoginPage.css";

export default function LoginPage({ onLoginSuccess, onCancel }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Create Basic Auth credentials
      const credentials = btoa(`${username}:${password}`);

      const response = await fetch(
        "https://lotoapi.photaichinh.org/api/login",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Use the token from response or the credentials as token
        const token = data.user.secret;
        onLoginSuccess(token);
        setUsername("");
        setPassword("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(
          errorData.message || "Tên đăng nhập hoặc mật khẩu không chính xác"
        );
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Đăng Nhập Quản Trị</h1>
          <p>Nhập mật khẩu để truy cập bảng điều khiển</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Tên Đăng Nhập</label>
            <input
              id="username"
              type="text"
              placeholder="Nhập tên đăng nhập..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật Khẩu</label>
            <input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading || !username || !password}
          >
            {isLoading ? "Đang Xử Lý..." : "Đăng Nhập"}
          </button>

          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
            disabled={isLoading}
          >
            Quay Lại
          </button>
        </form>

        <div className="login-info">
          <p>🔐 Bảng điều khiển quản trị dành cho nhân viên</p>
          <small>Mặc định: admin / admin123</small>
        </div>
      </div>
    </div>
  );
}
