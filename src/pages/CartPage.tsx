import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../CartContext";
import { API_BASE_URL } from "../config";

const CartPage: React.FC = () => {
  const { items, totalAmount, removeFromCart, clearCart } = useCart();

  const [customerEmail, setCustomerEmail] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [couponCode, setCouponCode] = useState("");

  const handlePlaceOrder = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!customerEmail) {
      setError("Podaj e-mail klienta.");
      return;
    }

    if (items.length === 0) {
      setError("Koszyk jest pusty.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail,
          customerFirstName,
          customerLastName,
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
          couponCode: couponCode || null,
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Błąd API: ${res.status} ${text}`);
      }

      const createdOrder = await res.json();
      setSuccessMessage(
        `Zamówienie utworzone. ID zamówienia: ${createdOrder.id}, kwota: ${createdOrder.totalAmount} zł`
      );
      clearCart();
    } catch (e: any) {
      setError(e.message ?? "Nie udało się złożyć zamówienia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Twój koszyk</h1>

      {items.length === 0 && <div className="empty-state"><p>Koszyk jest pusty</p><Link to="/">Przejdź do sklepu</Link></div>}

      {items.map((i) => (
        <div key={i.product.id} className="cart-item">
          <span>
            {i.product.name} x {i.quantity}
          </span>
          <span>{(i.product.price * i.quantity).toFixed(2)} zł</span>
          <button onClick={() => removeFromCart(i.product.id)}>Usuń</button>
        </div>
      ))}

      {items.length > 0 && (
        <>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--primary)", margin: "2rem 0" }}>
            Łączna kwota: {totalAmount.toFixed(2)} zł
          </div>

          <div style={{ backgroundColor: "var(--background)", padding: "2rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
            <h2 style={{ marginTop: 0 }}>Dane do wysyłki</h2>
            <div style={{ marginBottom: "1rem" }}>
              <label>E-mail</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="twoj@email.pl"
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>Imię</label>
              <input
                type="text"
                value={customerFirstName}
                onChange={(e) => setCustomerFirstName(e.target.value)}
                placeholder="Imię"
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>Nazwisko</label>
              <input
                type="text"
                value={customerLastName}
                onChange={(e) => setCustomerLastName(e.target.value)}
                placeholder="Nazwisko"
              />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label>Kod rabatowy (opcjonalnie)</label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Wprowadź kod rabatowy"
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <button onClick={handlePlaceOrder} disabled={loading} style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }}>
              {loading ? "Przetwarzanie..." : "Złóż zamówienie"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
