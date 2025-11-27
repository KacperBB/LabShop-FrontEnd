import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useAuth } from "../AuthContext";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Podaj e-mail i hasło.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Błąd logowania: ${res.status}`);
      }

      const data = await res.json();
      // zakładamy: { token, email, roles }
      login(data.token, data.email, data.roles);

      // jeśli admin/moderator -> do panelu admina, inaczej do głównej
      if (data.roles.includes("Admin") || data.roles.includes("Moderator")) {
        navigate("/admin/orders");
      } else {
        navigate("/");
      }
    } catch (e: any) {
      setError(e.message ?? "Nie udało się zalogować.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "calc(100vh - 80px)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      backgroundColor: "var(--surface)",
      padding: "2rem"
    }}>
      <div style={{ 
        width: "100%", 
        maxWidth: "420px",
        backgroundColor: "var(--background)", 
        padding: "3rem", 
        borderRadius: "var(--radius-lg)", 
        border: "1px solid var(--border)", 
        boxShadow: "var(--shadow-lg)" 
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "1.75rem" }}>Witaj ponownie</h1>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
            Zaloguj się do swojego konta
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: "0.9rem" }}>Adres e-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.pl"
              style={{ fontSize: "0.95rem" }}
            />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontSize: "0.9rem" }}>Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ fontSize: "0.95rem" }}
            />
          </div>
          {error && <div className="error-message" style={{ marginBottom: "1rem" }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ 
            width: "100%", 
            padding: "0.875rem",
            fontSize: "1rem",
            fontWeight: "600"
          }}>
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>

        <div style={{ 
          marginTop: "2rem", 
          paddingTop: "2rem", 
          borderTop: "1px solid var(--border)",
          textAlign: "center" 
        }}>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem" }}>
            Nie masz jeszcze konta?{" "}
            <Link to="/register" style={{ 
              color: "var(--primary)", 
              fontWeight: "600",
              textDecoration: "none"
            }}>
              Zarejestruj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
