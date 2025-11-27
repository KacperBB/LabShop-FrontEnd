import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { useAuth } from "../AuthContext";
import { Product, Tag } from "../types";

interface Category {
  id: number;
  name: string;
  slug: string;
}

const AdminProductsPage: React.FC = () => {
  const { token, isAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

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

      const [catRes, tagRes, prodRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/categories`),
        fetch(`${API_BASE_URL}/api/tags`),
        fetch(`${API_BASE_URL}/api/admin/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!catRes.ok) throw new Error("Błąd podczas pobierania kategorii");
      if (!tagRes.ok) throw new Error("Błąd podczas pobierania tagów");
      if (!prodRes.ok) throw new Error("Błąd podczas pobierania produktów (admin)");

      const cats: Category[] = await catRes.json();
      const tgs: Tag[] = await tagRes.json();
      const prods: Product[] = await prodRes.json();

      setCategories(cats);
      setTags(tgs);
      setProducts(prods);
    } catch (e: any) {
      setError(e.message ?? "Wystąpił błąd przy ładowaniu danych.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    } else {
      setLoading(false);
      setError("Brak uprawnień – to jest panel administracyjny.");
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <div className="error-message">Brak uprawnień do przeglądania tej strony.</div>;
  }

  if (loading) return <div className="loading"><p>Ładowanie produktów...</p></div>;
  if (error) return <div className="error-message">{error}</div>;

  const handleCategoryChange = async (productId: number, newCategoryId: number) => {
    if (!token) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/products/${productId}/category`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ categoryId: newCategoryId }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Błąd API: ${res.status}`);
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                categoryId: newCategoryId,
                category: categories.find((c) => c.id === newCategoryId) || p.category,
              }
            : p
        )
      );
    } catch (e: any) {
      alert(e.message ?? "Nie udało się zmienić kategorii produktu.");
    }
  };

  const handleTagToggle = async (product: Product, tagId: number) => {
    if (!token) return;

    const currentTagIds = (product.productTags || []).map((pt) => pt.tagId);
    const isSelected = currentTagIds.includes(tagId);

    const newTagIds = isSelected
      ? currentTagIds.filter((id) => id !== tagId)
      : [...currentTagIds, tagId];

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/products/${product.id}/tags`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tagIds: newTagIds }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Błąd API: ${res.status}`);
      }

      const updatedProductTags =
        newTagIds.map((id) => ({
          productId: product.id,
          tagId: id,
          tag: tags.find((t) => t.id === id)!,
        })) || [];

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, productTags: updatedProductTags } : p
        )
      );
    } catch (e: any) {
      alert(e.message ?? "Nie udało się zaktualizować tagów produktu.");
    }
  };

  if (!isAdmin) {
    return <p>Brak uprawnień do przeglądania tej strony.</p>;
  }

  if (loading) return <p>Ładowanie danych...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (products.length === 0) {
    return <p>Brak produktów.</p>;
  }

  return (
    <div>
      <h1>Panel admina – produkty</h1>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nazwa</th>
            <th>Kategoria</th>
            <th>Tagi</th>
            <th>Cena</th>
            <th>Stan</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const productTagIds = (p.productTags || []).map((pt) => pt.tagId);
            return (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>
                  <select
                    value={p.categoryId}
                    onChange={(e) =>
                      handleCategoryChange(p.id, Number(e.target.value))
                    }
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                    {tags.map((tag) => (
                      <label
                        key={tag.id}
                        style={{
                          border: "1px solid #ccc",
                          padding: "0.1rem 0.3rem",
                          borderRadius: "4px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={productTagIds.includes(tag.id)}
                          onChange={() => handleTagToggle(p, tag.id)}
                        />{" "}
                        {tag.name}
                      </label>
                    ))}
                  </div>
                </td>
                <td>{p.price.toFixed(2)} zł</td>
                <td>{p.stockQuantity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductsPage;
