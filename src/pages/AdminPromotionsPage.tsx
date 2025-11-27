import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { useAuth } from "../AuthContext";
import { Product, Promotion } from "../types";

const AdminPromotionsPage: React.FC = () => {
  const { token, isAdmin } = useAuth();

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState<number | "">("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  const [newPromoName, setNewPromoName] = useState("");
  const [newPromoDiscount, setNewPromoDiscount] = useState<number>(10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!token) {
      setError("Brak tokenu – zaloguj się jako admin.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [promoRes, productRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/promotions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/admin/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!promoRes.ok) throw new Error("Błąd pobierania promocji");
      if (!productRes.ok) throw new Error("Błąd pobierania produktów");

      const promos: Promotion[] = await promoRes.json();
      const prods: Product[] = await productRes.json();

      setPromotions(promos);
      setProducts(prods);
    } catch (e: any) {
      setError(e.message ?? "Błąd ładowania danych");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    } else {
      setLoading(false);
      setError("Brak uprawnień – panel admina.");
    }
  }, [isAdmin]);

  const toggleProductSelection = (id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const createPromotion = async () => {
    if (!token) return;
    if (!newPromoName || !newPromoDiscount) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/promotions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newPromoName,
          discountPercent: newPromoDiscount,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Błąd API: ${res.status}`);
      }

      const promo: Promotion = await res.json();
      setPromotions((prev) => [...prev, promo]);
      setNewPromoName("");
      setNewPromoDiscount(10);
    } catch (e: any) {
      alert(e.message ?? "Nie udało się utworzyć promocji.");
    }
  };

  const applyPromotion = async () => {
    if (!token || selectedPromotionId === "" || selectedProductIds.length === 0) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/promotions/${selectedPromotionId}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productIds: selectedProductIds }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Błąd API: ${res.status}`);
      }

      setProducts((prev) =>
        prev.map((p) =>
          selectedProductIds.includes(p.id)
            ? {
                ...p,
                promotionId: Number(selectedPromotionId),
                promotion:
                  promotions.find((pr) => pr.id === selectedPromotionId) || p.promotion,
              }
            : p
        )
      );
    } catch (e: any) {
      alert(e.message ?? "Nie udało się przypisać promocji.");
    }
  };

  const clearPromotion = async () => {
    if (!token || selectedProductIds.length === 0) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/promotions/clear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productIds: selectedProductIds }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Błąd API: ${res.status}`);
      }

      setProducts((prev) =>
        prev.map((p) =>
          selectedProductIds.includes(p.id)
            ? {
                ...p,
                promotionId: null,
                promotion: null,
              }
            : p
        )
      );
    } catch (e: any) {
      alert(e.message ?? "Nie udało się usunąć promocji z produktów.");
    }
  };

  if (!isAdmin) return <p>Brak uprawnień.</p>;
  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>Promocje – panel admina</h1>

      <section style={{ marginBottom: "1rem" }}>
        <h3>Nowa promocja</h3>
        <div>
          <label>
            Nazwa:
            <input
              value={newPromoName}
              onChange={(e) => setNewPromoName(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Zniżka (%):
            <input
              type="number"
              value={newPromoDiscount}
              onChange={(e) => setNewPromoDiscount(Number(e.target.value))}
            />
          </label>
        </div>
        <button onClick={createPromotion}>Utwórz promocję</button>
      </section>

      <section style={{ marginBottom: "1rem" }}>
        <h3>Przypisz promocję do produktów</h3>
        <div>
          <label>
            Promocja:
            <select
              value={selectedPromotionId}
              onChange={(e) =>
                setSelectedPromotionId(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            >
              <option value="">(wybierz)</option>
              {promotions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.discountPercent}%)
                </option>
              ))}
            </select>
          </label>
        </div>
        <button onClick={applyPromotion} disabled={selectedProductIds.length === 0}>
          Zastosuj promocję do zaznaczonych
        </button>
        <button onClick={clearPromotion} disabled={selectedProductIds.length === 0}>
          Usuń promocję z zaznaczonych
        </button>
      </section>

      <section>
        <h3>Produkty</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Nazwa</th>
              <th>Cena</th>
              <th>Promocja</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(p.id)}
                    onChange={() => toggleProductSelection(p.id)}
                  />
                </td>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.price.toFixed(2)} zł</td>
                <td>
                  {p.promotion
                    ? `${p.promotion.name} (${p.promotion.discountPercent}%)`
                    : "brak"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminPromotionsPage;
