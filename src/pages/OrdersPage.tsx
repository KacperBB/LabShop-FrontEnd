import React, { useState } from "react";
import { API_BASE_URL } from "../config";

interface OrderSummary {
  id: number;
  createdAt: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
}

const OrdersPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setError(null);
    setOrders([]);

    if (!email) {
      setError("Podaj adres e-mail.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/api/orders/by-email/${encodeURIComponent(email)}`
      );
      if (!res.ok) {
        throw new Error(`Błąd API: ${res.status}`);
      }
      const data = await res.json();
      setOrders(data);
    } catch (e: any) {
      setError(e.message ?? "Nie udało się pobrać zamówień.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Historia zamówień</h1>

      <div style={{ backgroundColor: "var(--background)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", marginBottom: "2rem" }}>
        <label>Wpisz swój adres e-mail</label>
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="twoj@email.pl"
            style={{ flex: 1 }}
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? "Szukam..." : "Szukaj"}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {orders.length === 0 && !loading && !error && email && (
        <div className="empty-state">
          <p>Brak zamówień dla podanego adresu e-mail</p>
        </div>
      )}

      {orders.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Data utworzenia</th>
                <th>Status</th>
                <th>Płatność</th>
                <th style={{ textAlign: "right" }}>Kwota</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><strong>#{o.id}</strong></td>
                  <td>{new Date(o.createdAt).toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                  <td><span style={{ padding: "0.25rem 0.75rem", borderRadius: "var(--radius)", backgroundColor: o.status === "Completed" ? "var(--success)" : "var(--warning)", color: "white", fontSize: "0.85rem" }}>{o.status}</span></td>
                  <td><span style={{ padding: "0.25rem 0.75rem", borderRadius: "var(--radius)", backgroundColor: o.paymentStatus === "Paid" ? "var(--success)" : "var(--warning)", color: "white", fontSize: "0.85rem" }}>{o.paymentStatus}</span></td>
                  <td style={{ textAlign: "right", fontWeight: "600", color: "var(--primary)" }}>{o.totalAmount.toFixed(2)} zł</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
