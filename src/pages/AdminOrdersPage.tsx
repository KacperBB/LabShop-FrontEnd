import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { useAuth } from "../AuthContext";
import { OrderDto } from "../types";
import { orderStatusOptions } from "../orderStatusHelpers";

const AdminOrdersPage: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!token) {
      setError("Brak tokenu – zaloguj się jako admin.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Błąd API: ${res.status}`);
      }

      const data: OrderDto[] = await res.json();
      setOrders(data);
    } catch (e: any) {
      setError(e.message ?? "Nie udało się pobrać zamówień.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    } else {
      setLoading(false);
      setError("Brak uprawnień – to jest panel administracyjny.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const handleStatusChange = async (orderId: number, newStatus: number) => {
    if (!token) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Błąd API: ${res.status}`);
      }

      // zaktualizuj stan lokalnie
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (e: any) {
      alert(e.message ?? "Nie udało się zmienić statusu.");
    }
  };

  if (!isAdmin) {
    return <div className="error-message">Brak uprawnień do przeglądania tej strony.</div>;
  }

  if (loading) return <div className="loading"><p>Ładowanie zamówień...</p></div>;
  if (error) return <div className="error-message">{error}</div>;

  if (orders.length === 0) {
    return <div className="empty-state"><p>Brak zamówień</p></div>;
  }

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0 }}>Zarządzanie zamówieniami</h1>
        <button className="secondary" onClick={fetchOrders}>↻ Odśwież</button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Data</th>
            <th>Klient</th>
            <th>Kwota</th>
            <th>Status</th>
            <th>Płatność</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
              <td>
                {o.customer?.firstName} {o.customer?.lastName}
                <br />
                {o.customer?.email}
              </td>
              <td>{o.totalAmount.toFixed(2)} zł</td>
              <td>
                <select
                  value={o.status}
                  onChange={(e) =>
                    handleStatusChange(o.id, Number(e.target.value))
                  }
                >
                  {orderStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </td>
              <td>{o.paymentStatus === 1 ? "Zapłacone" : "Nieopłacone"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
