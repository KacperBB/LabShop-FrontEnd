import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { useAuth } from "../AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface DailyStat {
  date: string;
  count: number;
  revenue: number;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  daily: DailyStat[];
}

const AdminStatsPage: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) {
        setError("Brak tokenu – zaloguj się jako admin.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/api/admin/orders/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Błąd API: ${res.status}`);
        }

        const data = await res.json();
        setStats(data);
      } catch (e: any) {
        setError(e.message ?? "Nie udało się pobrać statystyk.");
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchStats();
    } else {
      setLoading(false);
      setError("Brak uprawnień – panel admina.");
    }
  }, [isAdmin, token]);

  if (!isAdmin) return <p>Brak uprawnień.</p>;
  if (loading) return <p>Ładowanie statystyk...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!stats) return <p>Brak danych.</p>;

  // Przygotowanie danych do wykresu – zamiana ISO daty na prosty string
  const chartData = stats.daily.map((d) => ({
    dateLabel: new Date(d.date).toLocaleDateString(),
    orders: d.count,
    revenue: d.revenue,
  }));

  return (
    <div>
      <h1>Statystyki zamówień</h1>

      <section style={{ marginBottom: "1.5rem" }}>
        <p>
          <strong>Łączna liczba zamówień:</strong> {stats.totalOrders}
        </p>
        <p>
          <strong>Łączny przychód:</strong> {stats.totalRevenue.toFixed(2)} zł
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Liczba zamówień dziennie (ostatnie 30 dni)</h2>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateLabel" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" name="Liczba zamówień" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Przychód dzienny (ostatnie 30 dni)</h2>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateLabel" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Przychód (zł)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2>Szczegóły (tabela)</h2>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            fontSize: "0.9rem",
          }}
        >
          <thead>
            <tr>
              <th>Data</th>
              <th>Liczba zamówień</th>
              <th>Przychód</th>
            </tr>
          </thead>
          <tbody>
            {stats.daily.map((d) => (
              <tr key={d.date}>
                <td>{new Date(d.date).toLocaleDateString()}</td>
                <td>{d.count}</td>
                <td>{d.revenue.toFixed(2)} zł</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminStatsPage;
