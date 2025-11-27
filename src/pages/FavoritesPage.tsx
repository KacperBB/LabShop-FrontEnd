import React from "react";
import { useFavorites } from "../FavoritesContext";
import { Link } from "react-router-dom";

const FavoritesPage: React.FC = () => {
  const { favorites } = useFavorites();

  return (
    <div className="container">
      <h1>Ulubione produkty</h1>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <p>Nie masz jeszcze ulubionych produktów</p>
          <Link to="/">Przejdź do sklepu</Link>
        </div>
      ) : (
        <div className="product-list">
          {favorites.map((p) => (
            <div key={p.id} className="product-card">
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="product-image"
                />
              )}
              <h2>{p.name}</h2>
              <p>{p.description}</p>
              <p style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--primary)", marginTop: "auto" }}>
                {p.price.toFixed(2)} zł
              </p>
              <Link to={`/product/${p.id}`}>Zobacz szczegóły →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
