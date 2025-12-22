import { useState, useEffect } from "react";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import AdminPage from "./components/AdminPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [adminToken, setAdminToken] = useState(null);

  // Check for existing admin session and handle routing
  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (savedToken) {
      setAdminToken(savedToken);
    }

    // Handle URL-based routing
    const currentPath = window.location.pathname;
    if (currentPath === "/admin") {
      if (savedToken) {
        setCurrentPage("admin");
      } else {
        setCurrentPage("login");
      }
    }
  }, []);

  const handleAdminLogin = (token) => {
    setAdminToken(token);
    localStorage.setItem("adminToken", token);
    setCurrentPage("admin");
    window.history.pushState({}, "", "/admin");
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem("adminToken");
    setCurrentPage("home");
    window.history.pushState({}, "", "/");
  };

  const handleBackFromAdmin = () => {
    setCurrentPage("home");
    window.history.pushState({}, "", "/");
  };

  // Route-based rendering
  if (currentPage === "login") {
    return (
      <LoginPage
        onLoginSuccess={handleAdminLogin}
        onCancel={handleBackFromAdmin}
      />
    );
  }

  if (currentPage === "admin") {
    if (!adminToken) {
      return (
        <LoginPage
          onLoginSuccess={handleAdminLogin}
          onCancel={handleBackFromAdmin}
        />
      );
    }
    return (
      <AdminPage
        onBack={handleBackFromAdmin}
        onLogout={handleAdminLogout}
        adminToken={adminToken}
      />
    );
  }

  return <HomePage />;
}
