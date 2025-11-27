import { Routes, Route, Link } from "react-router-dom";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";

import ProductListPage from "./pages/ProductListPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import FavoritesPage from "./pages/FavoritesPage";
import OrdersPage from "./pages/OrdersPage";
import LoginPage from "./pages/LoginPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import RegisterPage from "./pages/RegisterPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminPromotionsPage from "./pages/AdminPromotionsPage";
import AdminStatsPage from "./pages/AdminStatsPage";


const App: React.FC = () => {
  const { totalItems } = useCart();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <div className="App">
      <header>
        <nav>
          <Link to="/" className="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span>ShopApp</span>
          </Link>
          
          <div className="nav-links">
            <Link to="/">Produkty</Link>
            <Link to="/favorites">Ulubione</Link>
            <Link to="/cart">Koszyk {totalItems > 0 && <span style={{ 
              backgroundColor: "var(--primary)", 
              color: "white", 
              borderRadius: "12px", 
              padding: "2px 8px", 
              fontSize: "0.75rem",
              fontWeight: "600",
              marginLeft: "4px"
            }}>{totalItems}</span>}</Link>
            <Link to="/orders">Zamówienia</Link>
            
            {isAdmin && (
              <>
                <div style={{ borderLeft: "2px solid var(--border)", height: "20px", margin: "0 0.5rem" }}></div>
                <Link to="/admin/orders">Admin: Zamówienia</Link>
                <Link to="/admin/products">Produkty</Link>
                <Link to="/admin/promotions">Promocje</Link>
                <Link to="/admin/stats">Statystyki</Link>
              </>
            )}
          </div>

          <div className="nav-actions">
            {!isAuthenticated ? (
              <>
                <Link to="/login">Zaloguj</Link>
                <Link to="/register" style={{ 
                  backgroundColor: "var(--primary)", 
                  color: "white",
                  fontWeight: "600"
                }}>Zarejestruj</Link>
              </>
            ) : (
              <button onClick={logout}>Wyloguj</button>
            )}
          </div>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/promotions" element={<AdminPromotionsPage />} />
          <Route path="/admin/stats" element={<AdminStatsPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
