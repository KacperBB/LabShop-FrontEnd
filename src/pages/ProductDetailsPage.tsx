import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useCart } from "../CartContext";
import { Product, ProductReview } from "../types";
import { useAuth } from "../AuthContext";

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");

  const reviewsCount = reviews.length;
  const averageRating = reviewsCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount : 0;
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Product = await res.json();
        setProduct(data);
      } catch (e: any) {
        setError(e.message ?? "Błąd podczas ładowania produktu");
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/${id}/reviews`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ProductReview[] = await res.json();
        setReviews(data);
      } catch (e: any) {
        console.error(e);
      }
    };

    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const sessionId = (() => {
  // prosty sessionId w localStorage – jeden na przeglądarkę / użytkownika
  const key = "sessionId";
  let value = localStorage.getItem(key);
  if (!value) {
    value = Math.random().toString(36).substring(2);
    localStorage.setItem(key, value);
  }
  return value;
})();

  useEffect(() => {
  const start = performance.now();

  return () => {
    if (!product) return;
    const end = performance.now();
    const durationSeconds = Math.round((end - start) / 1000);

    fetch(`${API_BASE_URL}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "ViewProduct",
        productId: product.id,
        sessionId,
        durationSeconds,
      }),
    }).catch(() => {});
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [product]);  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p>Błąd: {error}</p>;
  if (!product) return <p>Nie znaleziono produktu.</p>;

  const handleSubmitReview = async (e: React.FormEvent) => {
  e.preventDefault();
  setReviewError(null);

  if (!token) {
    setReviewError("Musisz być zalogowany, aby dodać opinię.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, comment }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Błąd API: ${res.status}`);
    }

    const newReview: ProductReview = await res.json();

    // albo podmieniamy istniejącą usera, albo dodajemy
    setReviews((prev) => {
      const idx = prev.findIndex((r) => r.id === newReview.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newReview;
        return copy;
      }
      return [newReview, ...prev];
    });

    setComment("");
  } catch (e: any) {
    setReviewError(e.message ?? "Nie udało się wysłać opinii.");
  }
};


  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "1200px", padding: "2rem 1rem" }}>
      {/* Breadcrumb */}
      <nav style={{ 
        marginBottom: "2.5rem", 
        fontSize: "0.875rem",
        padding: "0.75rem 1rem",
        backgroundColor: "var(--surface)",
        borderRadius: "var(--radius)",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem"
      }}>
        <Link to="/" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: "500" }}>🏠 Produkty</Link>
        {product?.category && (
          <>
            <span style={{ color: "var(--text-secondary)" }}>›</span>
            <span style={{ color: "var(--text-secondary)" }}>{product.category.name}</span>
          </>
        )}
        <span style={{ color: "var(--text-secondary)" }}>›</span>
        <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{product?.name}</span>
      </nav>

      {/* Product Main Section */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "55% 45%", 
        gap: "4rem", 
        marginBottom: "4rem",
        backgroundColor: "var(--background)",
        padding: "3rem",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        {/* Image Section */}
        <div style={{ position: "sticky", top: "2rem", alignSelf: "start" }}>
          {product?.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ 
                width: "100%", 
                height: "550px",
                objectFit: "cover",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "transform 0.3s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            />
          ) : (
            <div style={{
              width: "100%",
              height: "550px",
              backgroundColor: "var(--surface)",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "1rem",
              color: "var(--text-secondary)",
              border: "2px dashed var(--border)"
            }}>
              <div style={{ fontSize: "3rem" }}>📷</div>
              <div>Brak zdjęcia</div>
            </div>
          )}
        </div>
        
        {/* Product Info Section */}
        <div>
          <h1 style={{ 
            margin: "0 0 1.5rem 0", 
            fontSize: "2.25rem", 
            lineHeight: "1.2",
            fontWeight: "700",
            letterSpacing: "-0.02em"
          }}>
            {product?.name}
          </h1>
          
          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div className="review-stars" style={{ fontSize: "1.2rem", color: "var(--warning)" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < Math.round(averageRating) ? "★" : "☆"}</span>
              ))}
            </div>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              {averageRating.toFixed(1)} ({reviewsCount} {reviewsCount === 1 ? "opinia" : "opinii"})
            </span>
          </div>

          {/* Price */}
          <div style={{ 
            padding: "2rem", 
            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark, #2563eb) 100%)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "2rem",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)"
          }}>
            <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.9)", marginBottom: "0.5rem", fontWeight: "500", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Cena
            </div>
            <div style={{ fontSize: "3rem", fontWeight: "800", color: "white", letterSpacing: "-0.02em" }}>
              {product?.price.toFixed(2)} <span style={{ fontSize: "1.5rem" }}>zł</span>
            </div>
          </div>

          {/* Category & Tags */}
          <div style={{ marginBottom: "1.5rem" }}>
            {product?.category && (
              <div style={{ marginBottom: "0.75rem" }}>
                <span style={{ 
                  display: "inline-block",
                  padding: "0.375rem 0.75rem",
                  backgroundColor: "var(--surface)",
                  borderRadius: "var(--radius)",
                  fontSize: "0.85rem",
                  fontWeight: "500"
                }}>
                  📁 {product.category.name}
                </span>
              </div>
            )}
            
            {product?.productTags && product.productTags.length > 0 && (
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {product.productTags.map((pt, idx) => (
                  <span key={idx} style={{ 
                    display: "inline-block",
                    padding: "0.25rem 0.625rem",
                    backgroundColor: "var(--primary)",
                    color: "white",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    fontWeight: "500"
                  }}>
                    {pt.tag?.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stock */}
          <div style={{ 
            padding: "1.25rem 1.5rem",
            backgroundColor: product && product.stockQuantity > 0 ? "#f0fdf4" : "#fef2f2",
            border: `2px solid ${product && product.stockQuantity > 0 ? "var(--success)" : "var(--danger)"}`,
            borderRadius: "var(--radius-lg)",
            marginBottom: "2rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ 
                fontSize: "1.5rem",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: product && product.stockQuantity > 0 ? "var(--success)" : "var(--danger)",
                color: "white",
                borderRadius: "50%"
              }}>
                {product && product.stockQuantity > 0 ? "✓" : "✗"}
              </span>
              <div>
                <div style={{ 
                  fontWeight: "700",
                  fontSize: "1.05rem",
                  color: product && product.stockQuantity > 0 ? "var(--success)" : "var(--danger)"
                }}>
                  {product && product.stockQuantity > 0 
                    ? `Dostępne: ${product.stockQuantity} szt.` 
                    : "Brak w magazynie"}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                  {product && product.stockQuantity > 0 ? "Wysyłka w 24h" : "Powiadom mnie o dostępności"}
                </div>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "0.75rem", 
              fontSize: "0.9rem",
              fontWeight: "600",
              color: "var(--text-primary)"
            }}>
              Ilość:
            </label>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.75rem",
              padding: "0.5rem",
              backgroundColor: "var(--surface)",
              borderRadius: "var(--radius-lg)",
              width: "fit-content"
            }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="secondary"
                style={{ 
                  width: "48px", 
                  height: "48px", 
                  padding: 0, 
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  borderRadius: "var(--radius)"
                }}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={product?.stockQuantity || 1}
                style={{ 
                  width: "80px", 
                  textAlign: "center",
                  padding: "0.75rem",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  border: "2px solid var(--border)",
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--background)"
                }}
              />
              <button
                onClick={() => setQuantity(Math.min(product?.stockQuantity || 1, quantity + 1))}
                disabled={quantity >= (product?.stockQuantity || 1)}
                className="secondary"
                style={{ 
                  width: "48px", 
                  height: "48px", 
                  padding: 0, 
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  borderRadius: "var(--radius)"
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart} 
            disabled={!product || product.stockQuantity === 0}
            style={{ 
              width: "100%", 
              padding: "1.25rem", 
              fontSize: "1.125rem",
              fontWeight: "700",
              marginBottom: "1rem",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
            }}
          >
            🛒 Dodaj do koszyka
          </button>

          <Link 
            to="/" 
            className="secondary"
            style={{ 
              display: "block",
              textAlign: "center",
              padding: "1rem",
              textDecoration: "none",
              border: "2px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--background)",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
          >
            ← Kontynuuj zakupy
          </Link>
        </div>
      </div>

      {/* Tabs Section */}
      <div style={{ 
        backgroundColor: "var(--background)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        {/* Tab Headers */}
        <div style={{ 
          display: "flex",
          borderBottom: "2px solid var(--border)"
        }}>
          <button
            onClick={() => setActiveTab("description")}
            style={{
              flex: 1,
              padding: "1rem 2rem",
              fontSize: "1rem",
              fontWeight: "600",
              backgroundColor: activeTab === "description" ? "var(--background)" : "var(--surface)",
              color: activeTab === "description" ? "var(--primary)" : "var(--text-secondary)",
              borderBottom: activeTab === "description" ? "3px solid var(--primary)" : "none",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: activeTab === "description" ? "-2px" : "0"
            }}
          >
            📝 Opis produktu
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            style={{
              flex: 1,
              padding: "1rem 2rem",
              fontSize: "1rem",
              fontWeight: "600",
              backgroundColor: activeTab === "reviews" ? "var(--background)" : "var(--surface)",
              color: activeTab === "reviews" ? "var(--primary)" : "var(--text-secondary)",
              borderBottom: activeTab === "reviews" ? "3px solid var(--primary)" : "none",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: activeTab === "reviews" ? "-2px" : "0"
            }}
          >
            ⭐ Opinie ({reviewsCount})
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: "3rem 2.5rem" }}>
          {activeTab === "description" ? (
            <div>
              <h2 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.75rem", fontWeight: "700" }}>O produkcie</h2>
              <p style={{ 
                lineHeight: "1.8", 
                fontSize: "1.05rem",
                color: "var(--text-secondary)",
                marginBottom: "2.5rem"
              }}>
                {product?.description}
              </p>

              {/* Additional Product Info */}
              <div style={{ 
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1.5rem"
              }}>
                <div style={{ 
                  padding: "1.5rem",
                  backgroundColor: "var(--surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)"
                }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>
                    Kod produktu
                  </div>
                  <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>#{product?.id}</div>
                </div>
                <div style={{ 
                  padding: "1.5rem",
                  backgroundColor: "var(--surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)"
                }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>
                    Kategoria
                  </div>
                  <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>{product?.category?.name || "Brak"}</div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h2 style={{ margin: 0 }}>Opinie klientów</h2>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span className="review-stars" style={{ fontSize: "1.5rem" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < Math.round(averageRating) ? "★" : "☆"}</span>
                    ))}
                  </span>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "1.25rem" }}>
                      {averageRating.toFixed(1)}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {reviewsCount} {reviewsCount === 1 ? "opinia" : "opinii"}
                    </div>
                  </div>
                </div>
              </div>

              {reviews.length === 0 && (
                <div style={{ 
                  textAlign: "center", 
                  padding: "3rem",
                  backgroundColor: "var(--surface)",
                  borderRadius: "var(--radius)"
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</div>
                  <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                    Brak opinii. Bądź pierwszy!
                  </p>
                </div>
              )}

              {reviews.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {reviews.map((r) => (
                    <div key={r.id} style={{
                      padding: "1.5rem",
                      backgroundColor: "var(--surface)",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--border)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                        <div>
                          <strong style={{ fontSize: "1rem" }}>{r.userName}</strong>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                            {new Date(r.createdAt).toLocaleDateString("pl-PL", { 
                              year: "numeric", 
                              month: "long", 
                              day: "numeric" 
                            })}
                          </div>
                        </div>
                        <span className="review-stars" style={{ fontSize: "1.1rem" }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < r.rating ? "★" : "☆"}</span>
                          ))}
                        </span>
                      </div>
                      <p style={{ margin: 0, lineHeight: "1.6" }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Review Form */}
              {isAuthenticated ? (
                <div style={{ 
                  marginTop: "2rem", 
                  padding: "2rem", 
                  backgroundColor: "var(--surface)", 
                  borderRadius: "var(--radius)",
                  border: "2px dashed var(--border)"
                }}>
                  <h3 style={{ marginTop: 0 }}>Dodaj swoją opinię</h3>
                  <form onSubmit={handleSubmitReview}>
                    <div style={{ marginBottom: "1rem" }}>
                      <label>Twoja ocena</label>
                      <select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                      >
                        {[5, 4, 3, 2, 1].map((r) => (
                          <option key={r} value={r}>
                            {"★".repeat(r)} {r} {r === 1 ? "gwiazdka" : "gwiazdek"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                      <label>Twoja opinia</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        placeholder="Podziel się swoją opinią o produkcie..."
                        required
                      />
                    </div>
                    {reviewError && <div className="error-message" style={{ marginBottom: "1rem" }}>{reviewError}</div>}
                    <button type="submit" style={{ width: "100%" }}>
                      Wyślij opinię
                    </button>
                  </form>
                </div>
              ) : (
                <div style={{ 
                  marginTop: "2rem",
                  padding: "2rem", 
                  textAlign: "center",
                  backgroundColor: "var(--surface)",
                  borderRadius: "var(--radius)"
                }}>
                  <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    Zaloguj się, aby dodać opinię o produkcie
                  </p>
                  <Link 
                    to="/login" 
                    style={{
                      display: "inline-block",
                      padding: "0.75rem 2rem",
                      backgroundColor: "var(--primary)",
                      color: "white",
                      borderRadius: "var(--radius)",
                      textDecoration: "none",
                      fontWeight: "600"
                    }}
                  >
                    Zaloguj się
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductDetailsPage;
