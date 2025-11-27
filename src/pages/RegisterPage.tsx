import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Podaj e-mail i hasło.");
      return;
    }

    if (password !== passwordRepeat) {
      setError("Hasła nie są takie same.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Błąd rejestracji: ${res.status}`);
      }

      setSuccess("Konto zostało utworzone. Możesz się teraz zalogować.");
      // np. po 1–2 sekundach przerzucamy na /login
      setTimeout(() => navigate("/login"), 1000);
    } catch (e: any) {
      setError(e.message ?? "Nie udało się zarejestrować.");
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
        maxWidth: "480px",
        backgroundColor: "var(--background)", 
        padding: "3rem", 
        borderRadius: "var(--radius-lg)", 
        border: "1px solid var(--border)", 
        boxShadow: "var(--shadow-lg)" 
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "1.75rem" }}>Utwórz konto</h1>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
            Dołącz do nas i zacznij zakupy
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.9rem" }}>Imię</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jan"
                style={{ fontSize: "0.95rem" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.9rem" }}>Nazwisko</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Kowalski"
                style={{ fontSize: "0.95rem" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "0.9rem" }}>Adres e-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.pl"
              style={{ fontSize: "0.95rem" }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "0.9rem" }}>Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ fontSize: "0.95rem" }}
            />
            <small style={{ display: "block", marginTop: "0.25rem", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
              Minimum 6 znaków
            </small>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontSize: "0.9rem" }}>Powtórz hasło</label>
            <input
              type="password"
              value={passwordRepeat}
              onChange={(e) => setPasswordRepeat(e.target.value)}
              placeholder="••••••••"
              style={{ fontSize: "0.95rem" }}
            />
          </div>

          {error && <div className="error-message" style={{ marginBottom: "1rem" }}>{error}</div>}
          {success && <div className="success-message" style={{ marginBottom: "1rem" }}>{success}</div>}

          <button type="submit" disabled={loading} style={{ 
            width: "100%", 
            padding: "0.875rem",
            fontSize: "1rem",
            fontWeight: "600"
          }}>
            {loading ? "Tworzenie konta..." : "Utwórz konto"}
          </button>
        </form>

        <div style={{ 
          marginTop: "2rem", 
          paddingTop: "2rem", 
          borderTop: "1px solid var(--border)",
          textAlign: "center" 
        }}>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem" }}>
            Masz już konto?{" "}
            <Link to="/login" style={{ 
              color: "var(--primary)", 
              fontWeight: "600",
              textDecoration: "none"
            }}>
              Zaloguj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
