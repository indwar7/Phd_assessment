import { useEffect, useState } from "react";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import "../App.css";

const TOKEN_KEY = "admin_token";

export default function AdminApp() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || "");

  useEffect(() => {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  }, [token]);

  const handleLogout = () => setToken("");

  if (!token) return <AdminLogin onLoggedIn={setToken} />;
  return <AdminDashboard token={token} onLogout={handleLogout} />;
}
