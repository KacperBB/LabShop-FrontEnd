import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { Link } from "react-router-dom";
import { useFavorites } from "../FavoritesContext";
import { useCart } from "../CartContext";
import { Product, Tag } from "../types";

interface Category {
  id: number;
  name: string;
  slug: string;
}

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [selectedTagId, setSelectedTagId] = useState<number | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async (
    categoryId?: number,
    tagId?: number,
    query?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (categoryId) params.append("categoryId", String(categoryId));
      if (tagId) params.append("tagId", String(tagId));
      if (query) params.append("query", query);

      const url =
        params.toString().length > 0
          ? `${API_BASE_URL}/api/products/search?${params.toString()}`
          : `${API_BASE_URL}/api/products`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: Product[] = await res.json();
      setProducts(data);
    } catch (e: any) {
      setError(e.message ?? "Błąd podczas ładowania produktów");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndTags = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/categories`),
        fetch(`${API_BASE_URL}/api/tags`),
      ]);

      if (!catRes.ok) throw new Error("Błąd pobierania kategorii");
      if (!tagRes.ok) throw new Error("Błąd pobierania tagów");

      const cats: Category[] = await catRes.json();
      const tgs: Tag[] = await tagRes.json();

      setCategories(cats);
      setTags(tgs);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const applyFilters = () => {
    fetchProducts(
      selectedCategoryId === "" ? undefined : selectedCategoryId,
      selectedTagId === "" ? undefined : selectedTagId,
      searchQuery || undefined
    );
  };

  useEffect(() => {
    fetchCategoriesAndTags();
    fetchProducts();
  }, []);

  if (loading) return <div className="loading"><p>Ładowanie produktów...</p></div>;
  if (error) return <div className="error-message">Błąd: {error}</div>;

  return (
    <div className="layout-with-sidebar">
      {/* Sidebar z filtrami */}
      <aside className="sidebar">
        <div className="sidebar-content">
          <h3>Filtry</h3>
          
          <div className="filter-group">
            <label>Wyszukaj</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj produktu..."
            />
          </div>

          <div className="filter-group">
            <label>Kategoria</label>
            <select
              value={selectedCategoryId}
              onChange={(e) =>
                setSelectedCategoryId(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            >
              <option value="">Wszystkie kategorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Tag</label>
            <select
              value={selectedTagId}
              onChange={(e) =>
                setSelectedTagId(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            >
              <option value="">Wszystkie tagi</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <button onClick={applyFilters} style={{ width: "100%", marginTop: "1rem" }}>
            Zastosuj filtry
          </button>
        </div>
      </aside>

      {/* Główna zawartość - produkty */}
      <div>
        <div className="products-header">
          <h1>Produkty</h1>
          <span className="products-count">{products.length} {products.length === 1 ? "produkt" : "produktów"}</span>
        </div>

        {products.length === 0 ? (
          <div className="empty-state">
            <p>Nie znaleziono produktów spełniających kryteria</p>
          </div>
        ) : (
          <div className="product-list">
            {products.map((p) => (
              <div key={p.id} className="product-card">
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="product-image"
                  />
                )}
                <div className="product-card-content">
                  <h2>{p.name}</h2>
                  
                  {(p.category || (p.productTags && p.productTags.length > 0)) && (
                    <div className="product-meta">
                      {p.category && <span>{p.category.name}</span>}
                      {p.category && p.productTags && p.productTags.length > 0 && " • "}
                      {p.productTags && p.productTags.length > 0 && (
                        <span>{p.productTags.map((pt) => pt.tag?.name).join(", ")}</span>
                      )}
                    </div>
                  )}
                  
                  <p>{p.description}</p>
                  
                  <div className="product-price">
                    {p.price.toFixed(2)} zł
                  </div>
                  
                  <div className="product-actions">
                    <Link to={`/product/${p.id}`} style={{ textAlign: "center", padding: "0.625rem" }}>
                      Zobacz szczegóły
                    </Link>
                    <button onClick={() => handleAddToCart(p)}>
                      Dodaj do koszyka
                    </button>
                    <button className="secondary" onClick={() => toggleFavorite(p)}>
                      {isFavorite(p.id) ? "★ Ulubione" : "☆ Dodaj do ulubionych"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;
