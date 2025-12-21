import { useState } from "react";
import "./LoginPage.css";

export default function LoginPage({ onLoginSuccess, onCancel }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Simple hardcoded credentials (in production, use backend authentication)
  const ADMIN_PASSWORD = "admin123";

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate login delay
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        // Generate a simple token (in production, use JWT)
        const token = btoa(`admin:${Date.now()}`);
        onLoginSuccess(token);
        setPassword("");
      } else {
        setError("Mật khẩu không chính xác");
      }
      setIsLoading(false);
    }, 500);
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
            <label htmlFor="password">Mật Khẩu</label>
            <input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu quản trị..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading || !password}
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
          <small>Vui lòng nhập mật khẩu chính xác</small>
        </div>
      </div>
    </div>
  );
}
