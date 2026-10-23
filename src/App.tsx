import { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  CreditCard,
  Heart,
  Instagram,
  Leaf,
  LogIn,
  Menu,
  Minus,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  User,
  X,
} from 'lucide-react';
import { fallbackCategories, fallbackProducts, fetchStorefrontData } from './services/storefrontService';
import './styles.css';

/* ─── Types ──────────────────────────────────────────────── */
type Category = {
  slug: string;
  name: string;
  description: string;
  accent: string;
  image: string;
};

type Product = {
  id: number;
  name: string;
  category: string;
  tag: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  benefits: string[];
  care: string[];
  stock: number;
};

type CartItem = {
  productId: number;
  quantity: number;
};

type Order = {
  id: string;
  date: string;
  total: number;
  status: string;
  items: string[];
};

type UserProfile = {
  name: string;
  email: string;
  location: string;
};

/* ─── Currency Formatter ─────────────────────────────────── */
const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/* ─── Seed Data ──────────────────────────────────────────── */
const initialOrders: Order[] = [
  { id: 'VK-1048', date: 'Mar 14, 2025', total: 7360, status: 'Delivered', items: ['Monstera Deliciosa', 'Potting mix'] },
  { id: 'VK-1019', date: 'Feb 18, 2025', total: 4640, status: 'Shipped', items: ['Parlor Palm', 'Plant stand'] },
];

const initialProfile: UserProfile = {
  name: 'Maya Stewart',
  email: 'maya@verdantnursery.com',
  location: 'Bangalore, KA',
};

/* ─── Toast Component ────────────────────────────────────── */
function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="toast" role="alert" aria-live="polite">
      <span>{message}</span>
    </div>
  );
}

/* ─── Leaf SVG Emblem ────────────────────────────────────── */
function LeafEmblem({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 4C18 4 8 10 8 20C8 26.627 12.477 32 18 32C23.523 32 28 26.627 28 20C28 10 18 4 18 4Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M18 32V16"
        stroke="rgba(248,246,239,0.6)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18 22C18 22 14 18 11 16"
        stroke="rgba(248,246,239,0.6)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18 26C18 26 22 22 25 20"
        stroke="rgba(248,246,239,0.6)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── App Root ───────────────────────────────────────────── */
function App() {
  const [cart, setCart] = useState<CartItem[]>([
    { productId: 1, quantity: 1 },
    { productId: 8, quantity: 2 },
  ]);
  const [wishlist, setWishlist] = useState<number[]>([3, 6]);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dataMode, setDataMode] = useState<'mock' | 'api'>('mock');
  const [catalog, setCatalog] = useState({ categories: fallbackCategories, products: fallbackProducts });
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (dataMode !== 'api') {
      return;
    }
    let isMounted = true;
    fetchStorefrontData().then((nextCatalog) => {
      if (isMounted) {
        setCatalog(nextCatalog);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [dataMode]);

  const categories = dataMode === 'api' ? catalog.categories : fallbackCategories;
  const products = dataMode === 'api' ? catalog.products : fallbackProducts;
  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

  const cartItems = cart
    .map((entry) => ({ ...entry, product: productMap.get(entry.productId) }))
    .filter((entry): entry is { productId: number; quantity: number; product: Product } => Boolean(entry.product));

  const wishlistItems = products.filter((product) => wishlist.includes(product.id));
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2800);
  };

  const addToCart = (productId: number, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...current, { productId, quantity }];
    });
    showToast(`${productMap.get(productId)?.name ?? 'Item'} added to your bag`);
  };

  const updateQuantity = (productId: number, nextQuantity: number) => {
    setCart((current) =>
      current
        .map((item) => (item.productId === productId ? { ...item, quantity: nextQuantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
  };

  const toggleWishlist = (productId: number) => {
    setWishlist((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  };

  const completeCheckout = () => {
    const items = cartItems.map((item) => `${item.product.name} × ${item.quantity}`);
    const newOrder: Order = {
      id: `VK-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      total: cartTotal,
      status: 'Processing',
      items,
    };
    setOrders((current) => [newOrder, ...current]);
    setCart([]);
  };

  return (
    <BrowserRouter>
      <div className="app-shell">
        <AppHeader
          cartCount={cartCount}
          dataMode={dataMode}
          mobileMenuOpen={mobileMenuOpen}
          scrolled={scrolled}
          setDataMode={setDataMode}
          setMobileMenuOpen={setMobileMenuOpen}
          wishlistCount={wishlistItems.length}
        />
        <main className="page-shell">
          <Routes>
            <Route path="/" element={<HomePage categories={categories} products={products} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />} />
            <Route path="/shop" element={<ShopPage categories={categories} products={products} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />} />
            <Route path="/shop/:categorySlug" element={<CategoryPage categories={categories} products={products} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />} />
            <Route path="/product/:productId" element={<ProductDetailPage products={products} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />} />
            <Route
              path="/cart"
              element={
                <CartPage
                  cartItems={cartItems}
                  cartTotal={cartTotal}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                  onCheckout={completeCheckout}
                />
              }
            />
            <Route path="/wishlist" element={<WishlistPage products={products} wishlistItems={wishlistItems} addToCart={addToCart} toggleWishlist={toggleWishlist} />} />
            <Route path="/checkout" element={<CheckoutPage cartItems={cartItems} cartTotal={cartTotal} onComplete={completeCheckout} />} />
            <Route path="/orders" element={<OrdersPage orders={orders} />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/profile" element={<ProfilePage profile={profile} setProfile={setProfile} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <Toast message={toast} />
      </div>
    </BrowserRouter>
  );
}

/* ─── AppHeader ──────────────────────────────────────────── */
function AppHeader({
  cartCount,
  dataMode,
  mobileMenuOpen,
  scrolled,
  setDataMode,
  setMobileMenuOpen,
  wishlistCount,
}: {
  cartCount: number;
  dataMode: 'mock' | 'api';
  mobileMenuOpen: boolean;
  scrolled: boolean;
  setDataMode: (value: 'mock' | 'api') => void;
  setMobileMenuOpen: (value: boolean) => void;
  wishlistCount: number;
}) {
  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/orders', label: 'Journal' },
    { to: '/orders', label: 'About' },
  ];

  const drawerNavItems = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/orders', label: 'Orders' },
    { to: '/wishlist', label: 'Wishlist' },
    { to: '/profile', label: 'Profile' },
    { to: '/login', label: 'Login' },
  ];

  return (
    <>
      <header className={`topbar${scrolled ? ' scrolled' : ''}`}>
        <div className="announcement-bar">
          <div className="container announcement-inner">
            <span>Free delivery on orders over ₹2,999 · Fresh arrivals every Friday</span>
            <span>Est. 2019 · Bangalore · Thoughtfully grown</span>
          </div>
        </div>
        <div className="container nav-wrap">
          <Link to="/" className="brand" aria-label="Verdant home">
            <LeafEmblem className="brand-emblem" />
            <div className="brand-text">
              <span className="brand-name">Verdant</span>
              <span className="brand-sub">Plant Studio</span>
            </div>
          </Link>

          <nav className="nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              className="nav-mode-pill"
              onClick={() => setDataMode(dataMode === 'mock' ? 'api' : 'mock')}
              title={`Switch to ${dataMode === 'mock' ? 'API' : 'mock'} mode`}
            >
              {dataMode === 'mock' ? 'Mock' : 'API'}
            </button>
            <button className="icon-button" aria-label="Search">
              <Search size={17} />
            </button>
            <Link to="/wishlist" className="icon-button" aria-label={`Wishlist (${wishlistCount} items)`}>
              <Heart size={17} />
              {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
            </Link>
            <Link to="/cart" className="icon-button" aria-label={`Shopping bag (${cartCount} items)`}>
              <ShoppingBag size={17} />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>
            <Link to="/login" className="button button-primary nav-cta" style={{ padding: '0.55rem 1.2rem', fontSize: '0.84rem' }}>
              <LogIn size={15} />
              Login
            </Link>
            <button
              className="mobile-menu-toggle"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer${mobileMenuOpen ? ' open' : ''}`} aria-hidden={!mobileMenuOpen}>
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        />
        <div className="mobile-drawer-panel" role="dialog" aria-label="Navigation menu">
          <button
            className="drawer-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
          {drawerNavItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => (isActive ? 'drawer-nav-link active' : 'drawer-nav-link')}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <div className="drawer-actions">
            <button
              type="button"
              className="button button-secondary full-width"
              onClick={() => {
                setDataMode(dataMode === 'mock' ? 'api' : 'mock');
                setMobileMenuOpen(false);
              }}
            >
              {dataMode === 'mock' ? 'Switch to API mode' : 'Switch to Mock data'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── HomePage ───────────────────────────────────────────── */
function HomePage({
  addToCart,
  toggleWishlist,
  wishlist,
  categories,
  products,
}: {
  addToCart: (productId: number, quantity?: number) => void;
  toggleWishlist: (productId: number) => void;
  wishlist: number[];
  categories: Category[];
  products: Product[];
}) {
  const featured = products.slice(0, 4);
  const spotlight = products[0];

  /* Plant finder state */
  const [finderLocation, setFinderLocation] = useState<string | null>(null);
  const [finderLight, setFinderLight] = useState<string | null>(null);
  const [finderWater, setFinderWater] = useState<string | null>(null);

  const finderSuggestions = useMemo(() => {
    if (!finderLocation && !finderLight && !finderWater) return [];
    let results = [...products];
    if (finderLight === 'Low Light') {
      results = results.filter((p) => p.tag.toLowerCase().includes('low') || p.category === 'low-light');
    } else if (finderLight === 'Filtered Light') {
      results = results.filter((p) => p.category === 'indoor' || p.tag.toLowerCase().includes('pet'));
    }
    if (finderWater === 'Rarely') {
      results = results.filter((p) => p.category === 'low-light' || p.tag.toLowerCase().includes('low'));
    } else if (finderWater === 'Daily') {
      results = results.filter((p) => p.category === 'gifts' || p.tag.toLowerCase().includes('gift'));
    }
    if (finderLocation === 'Outdoor') {
      results = results.filter((p) => p.tag.toLowerCase().includes('pet') || p.category === 'pet-friendly');
    } else if (finderLocation === 'Balcony') {
      results = results.filter((p) => p.category === 'gifts' || p.tag.toLowerCase().includes('gift'));
    }
    if (results.length === 0) results = products.slice(0, 3);
    return results.slice(0, 3);
  }, [finderLocation, finderLight, finderWater, products]);

  const hasFinderSelection = finderLocation || finderLight || finderWater;

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero" aria-label="Hero">
        <div className="hero-bg">
          <img
            src="https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=2400&q=90"
            alt="Lush monstera plant in warm home setting"
            loading="eager"
          />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <p className="hero-eyebrow">Thoughtfully grown · Bangalore</p>
          <h1 className="hero-headline">{"Make Room for\nSomething Living."}</h1>
          <p className="hero-sub">
            Premium botanical plants for slower mornings, greener spaces, and homes that feel alive.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="button button-terracotta">
              Explore the Collection <ArrowRight size={16} />
            </Link>
            <Link to="/shop/low-light" className="button button-ghost">
              Find Your Plant
            </Link>
          </div>
        </div>
        <div className="hero-annotation">Est. 2019 · Thoughtfully grown</div>
        <div className="hero-scroll-indicator" aria-hidden="true">
          <div className="hero-scroll-line" />
          <ChevronDown size={16} className="hero-scroll-chevron" />
        </div>
      </section>

      {/* ── Collections ── */}
      <section className="container editorial-collections section-block">
        <div className="section-header">
          <div>
            <p className="eyebrow">Collections</p>
            <h2>Curated for every corner of your home</h2>
          </div>
          <Link to="/shop" className="text-link">Browse all plants <ArrowRight size={14} /></Link>
        </div>
        <div className="collection-layout">
          <Link
            to={`/shop/${categories[0]?.slug ?? 'indoor'}`}
            className="collection-card collection-feature"
            aria-label={`Shop ${categories[0]?.name ?? 'Indoor Plants'}`}
          >
            <img
              className="collection-img"
              src="https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?auto=format&fit=crop&w=1200&q=80"
              alt={categories[0]?.name ?? 'Indoor plants'}
            />
            <div className="collection-card-content">
              <span className="collection-kicker">Signature</span>
              <h3>{categories[0]?.name ?? 'Indoor Plants'}</h3>
              <p>{categories[0]?.description ?? 'Air-purifying greens for bright, calm interiors.'}</p>
              <span className="collection-arrow">Shop now <ArrowRight size={14} /></span>
            </div>
          </Link>
          <div className="collection-stack">
            {categories.slice(1, 3).map((category, i) => (
              <Link
                key={category.slug}
                to={`/shop/${category.slug}`}
                className="collection-card collection-small"
                aria-label={`Shop ${category.name}`}
              >
                <img
                  className="collection-img"
                  src={
                    i === 0
                      ? 'https://images.unsplash.com/photo-1602923668104-8f9e03e77b8b?auto=format&fit=crop&w=900&q=80'
                      : 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=900&q=80'
                  }
                  alt={category.name}
                />
                <div className="collection-card-content">
                  <span className="collection-kicker">Curated</span>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <span className="collection-arrow">Shop now <ArrowRight size={12} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Spotlight ── */}
      {spotlight && (
        <section className="spotlight-outer" aria-label="Plant spotlight">
          <div className="spotlight-layout">
            <div className="spotlight-image-wrap">
              <img src={spotlight.image} alt={spotlight.name} />
            </div>
            <div className="spotlight-copy">
              <p className="eyebrow">Plant Spotlight</p>
              <h2>{spotlight.name}</h2>
              <p className="spotlight-story">
                A sculptural statement plant with lush, distinctive leaves that instantly brings depth and a grounded sense of life to any room. One of our most loved classics.
              </p>
              <div className="spotlight-chips">
                <span className="spotlight-chip">
                  <Star size={13} fill="#f6b73c" color="#f6b73c" /> {spotlight.rating} rating
                </span>
                <span className="spotlight-chip">
                  {spotlight.reviews} reviews
                </span>
                <span className="spotlight-chip">
                  {currency.format(spotlight.price)}
                </span>
                {spotlight.stock < 10 && (
                  <span className="spotlight-chip">
                    Only {spotlight.stock} left
                  </span>
                )}
              </div>
              <div className="spotlight-cta">
                <button className="button button-terracotta" onClick={() => addToCart(spotlight.id)}>
                  Add to bag
                </button>
                <Link to={`/product/${spotlight.id}`} className="button button-ghost">
                  View details
                </Link>
              </div>
              <svg className="spotlight-leaf-bg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M100 10C100 10 20 50 20 110C20 155 56 190 100 190C144 190 180 155 180 110C180 50 100 10 100 10Z" fill="white" />
              </svg>
            </div>
          </div>
        </section>
      )}

      {/* ── Features Panel ── */}
      <section className="container section-block">
        <div className="highlight-panel">
          <div className="mini-feature">
            <div className="icon-wrap"><Leaf size={22} /></div>
            <div>
              <strong>Expertly sourced</strong>
              <p>Healthy plants selected by our botanists for lasting beauty.</p>
            </div>
          </div>
          <div className="mini-feature">
            <div className="icon-wrap"><ShoppingBag size={22} /></div>
            <div>
              <strong>Gift-ready bundles</strong>
              <p>Thoughtful collections for every celebration and season.</p>
            </div>
          </div>
          <div className="mini-feature">
            <div className="icon-wrap"><BadgeCheck size={22} /></div>
            <div>
              <strong>Plant care support</strong>
              <p>Guidance from first repot to thriving growth, free for all orders.</p>
            </div>
          </div>
          <div className="mini-feature">
            <div className="icon-wrap"><Truck size={22} /></div>
            <div>
              <strong>Thoughtful shipping</strong>
              <p>Free delivery on orders over ₹2,999. Ships in 2–4 days.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Best Sellers ── */}
      <section className="container section-block">
        <div className="section-header">
          <div>
            <p className="eyebrow">Best Sellers</p>
            <h2>The plants everyone loves</h2>
          </div>
        </div>
        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              toggleWishlist={toggleWishlist}
              isSaved={wishlist.includes(product.id)}
            />
          ))}
        </div>
      </section>

      {/* ── Plant Finder ── */}
      <section className="container">
        <div className="finder-section">
          <div className="finder-layout">
            <div className="finder-left">
              <p className="eyebrow">Plant Finder</p>
              <h2>Not sure what will thrive?</h2>
              <p>
                Tell us about your space and we'll suggest plants that suit the rhythm of your home. Not AI-powered — just our honest recommendations.
              </p>
              {hasFinderSelection && finderSuggestions.length > 0 && (
                <div className="finder-results">
                  <p className="finder-results-label">Suggested for your space</p>
                  <div className="finder-suggestions">
                    {finderSuggestions.map((product) => (
                      <Link key={product.id} to={`/product/${product.id}`} className="finder-suggestion">
                        <img src={product.image} alt={product.name} />
                        <div className="finder-suggestion-info">
                          <div className="finder-suggestion-name">{product.name}</div>
                          <div className="finder-suggestion-price">{currency.format(product.price)}</div>
                        </div>
                        <ArrowRight size={16} color="var(--muted)" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="finder-right">
              <div className="finder-group">
                <p className="finder-group-label">Where will your plant live?</p>
                <div className="finder-pills">
                  {['Indoor', 'Outdoor', 'Balcony'].map((opt) => (
                    <button
                      key={opt}
                      className={`finder-pill${finderLocation === opt ? ' selected' : ''}`}
                      onClick={() => setFinderLocation(finderLocation === opt ? null : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="finder-group">
                <p className="finder-group-label">How much light does it get?</p>
                <div className="finder-pills">
                  {['Full Sun', 'Filtered Light', 'Low Light'].map((opt) => (
                    <button
                      key={opt}
                      className={`finder-pill${finderLight === opt ? ' selected' : ''}`}
                      onClick={() => setFinderLight(finderLight === opt ? null : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="finder-group">
                <p className="finder-group-label">How often can you water?</p>
                <div className="finder-pills">
                  {['Daily', 'Weekly', 'Rarely'].map((opt) => (
                    <button
                      key={opt}
                      className={`finder-pill${finderWater === opt ? ' selected' : ''}`}
                      onClick={() => setFinderWater(finderWater === opt ? null : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              {!hasFinderSelection && (
                <p style={{ fontSize: '0.84rem', color: 'var(--muted)', marginTop: '1.25rem' }}>
                  Select options above to see plant suggestions.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Storytelling ── */}
      <section className="container section-block">
        <div className="story-section">
          <img
            className="story-image"
            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=2000&q=80"
            alt="Greenhouse with botanical plants"
          />
          <div className="story-card">
            <h2>Good things grow slowly.</h2>
            <p>
              We believe a well-chosen plant changes a room — and a home. Since 2019, we've been sourcing from small nurseries around Bangalore, choosing plants that are genuinely healthy and matched to our climate.
            </p>
            <Link to="/shop" className="button button-terracotta">
              Browse the collection <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Journal ── */}
      <section className="container journal-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">The Journal</p>
            <h2>Guides for a greener home</h2>
          </div>
          <Link to="/shop" className="text-link">See all guides <ArrowRight size={14} /></Link>
        </div>
        <div className="journal-grid">
          <article className="journal-featured">
            <img
              src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80"
              alt="Botanical home styling"
              loading="lazy"
            />
            <div className="journal-copy">
              <span className="journal-tag">Styling</span>
              <h3>Designing a home that feels lived in, not staged.</h3>
              <p>Thoughtful placement, softer light, and a few durable favourites can bring fresh life into daily rituals.</p>
              <span className="journal-read-time">6 min read</span>
            </div>
          </article>
          <article className="journal-card">
            <img
              src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80"
              alt="Plant care routine"
              loading="lazy"
            />
            <div className="journal-copy">
              <span className="journal-tag">Care Guide</span>
              <h3>Easy routines for brighter, healthier leaves.</h3>
              <span className="journal-read-time">4 min read</span>
            </div>
          </article>
          <article className="journal-card">
            <img
              src="https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=900&q=80"
              alt="Layering plant textures"
              loading="lazy"
            />
            <div className="journal-copy">
              <span className="journal-tag">Seasonal</span>
              <h3>Layering texture for a greener, calmer room.</h3>
              <span className="journal-read-time">5 min read</span>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}

/* ─── ProductCard ────────────────────────────────────────── */
function ProductCard({
  product,
  addToCart,
  toggleWishlist,
  isSaved,
}: {
  product: Product;
  addToCart: (productId: number, quantity?: number) => void;
  toggleWishlist: (productId: number) => void;
  isSaved: boolean;
}) {
  return (
    <article className="product-card">
      <div className="product-media">
        <Link to={`/product/${product.id}`} className="product-media-link" aria-label={`View ${product.name}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
        <button
          className={`wish-toggle${isSaved ? ' saved' : ''}`}
          onClick={() => toggleWishlist(product.id)}
          aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={isSaved}
        >
          <Heart size={15} fill={isSaved ? 'var(--terracotta)' : 'none'} color={isSaved ? 'var(--terracotta)' : 'currentColor'} />
        </button>
        <span className="product-tag">{product.tag}</span>
        {product.stock < 10 && (
          <span className="stock-badge">Only {product.stock} left</span>
        )}
        <button
          className="card-add-btn"
          onClick={() => addToCart(product.id)}
          aria-label={`Add ${product.name} to bag`}
        >
          Add to bag
        </button>
      </div>
      <div className="product-body">
        <div className="product-meta">
          <span>{product.category}</span>
          <span className="rating">
            <Star size={12} fill="#f6b73c" color="#f6b73c" /> {product.rating}
          </span>
        </div>
        <Link to={`/product/${product.id}`} className="product-name">
          {product.name}
        </Link>
        <div className="price-row">
          <strong>{currency.format(product.price)}</strong>
          {product.originalPrice && (
            <span>{currency.format(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </article>
  );
}

/* ─── ShopPage ───────────────────────────────────────────── */
function ShopPage({
  addToCart,
  toggleWishlist,
  wishlist,
  categories,
  products,
}: {
  addToCart: (productId: number, quantity?: number) => void;
  toggleWishlist: (productId: number) => void;
  wishlist: number[];
  categories: Category[];
  products: Product[];
}) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');

  const filterOptions = [
    { label: 'All Plants', value: 'all' },
    ...categories.map((c) => ({ label: c.name, value: c.slug })),
  ];

  const filtered = useMemo(() => {
    let result = activeCategory === 'all' ? products : products.filter((p) => p.category === activeCategory);
    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, activeCategory, sortBy]);

  return (
    <>
      <div className="shop-hero">
        <p className="eyebrow">Plant Collection</p>
        <h1>Shop All Plants</h1>
        <p>Thoughtfully sourced botanicals for every space and style.</p>
      </div>
      <div className="container section-block" style={{ paddingTop: '1.5rem' }}>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="current">Shop</span>
        </nav>
        <div className="filter-bar" role="group" aria-label="Filter by category">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              className={`filter-pill${activeCategory === opt.value ? ' active' : ''}`}
              onClick={() => setActiveCategory(opt.value)}
              aria-pressed={activeCategory === opt.value}
            >
              {opt.label}
            </button>
          ))}
          {activeCategory !== 'all' && (
            <button className="filter-pill-clear" onClick={() => setActiveCategory('all')} aria-label="Clear filter">
              <X size={13} /> Clear
            </button>
          )}
        </div>
        <div className="shop-toolbar">
          <p className="shop-count">{filtered.length} plant{filtered.length !== 1 ? 's' : ''}</p>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort products"
          >
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name: A–Z</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-emoji">🌿</span>
            <h3>No plants found</h3>
            <p>Try a different filter or browse all our plants.</p>
            <button className="button button-primary" onClick={() => setActiveCategory('all')}>
              Show all plants
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
                isSaved={wishlist.includes(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ─── CategoryPage ───────────────────────────────────────── */
function CategoryPage({
  addToCart,
  toggleWishlist,
  wishlist,
  categories,
  products,
}: {
  addToCart: (productId: number, quantity?: number) => void;
  toggleWishlist: (productId: number) => void;
  wishlist: number[];
  categories: Category[];
  products: Product[];
}) {
  const params = useParams();
  const category = categories.find((item) => item.slug === params.categorySlug);
  const items = products.filter((product) => product.category === params.categorySlug);

  if (!category) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <>
      <div className="category-hero-banner">
        <img src={category.image} alt={category.name} />
        <div className="category-hero-overlay">
          <div className="category-hero-text">
            <p className="eyebrow">Collection</p>
            <h1>{category.name}</h1>
            <p>{category.description}</p>
          </div>
        </div>
      </div>
      <div className="container" style={{ paddingBottom: '5rem' }}>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/shop">Shop</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="current">{category.name}</span>
        </nav>
        <div className="shop-toolbar" style={{ marginBottom: '1.75rem' }}>
          <p className="shop-count">{items.length} plant{items.length !== 1 ? 's' : ''} in this collection</p>
        </div>
        {items.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-emoji">🌱</span>
            <h3>Coming soon</h3>
            <p>We're preparing this collection. Browse all plants in the meantime.</p>
            <Link to="/shop" className="button button-primary">Browse all plants</Link>
          </div>
        ) : (
          <div className="product-grid">
            {items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
                isSaved={wishlist.includes(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ─── ProductDetailPage ──────────────────────────────────── */
function ProductDetailPage({
  addToCart,
  toggleWishlist,
  wishlist,
  products,
}: {
  addToCart: (productId: number, quantity?: number) => void;
  toggleWishlist: (productId: number) => void;
  wishlist: number[];
  products: Product[];
}) {
  const params = useParams();
  const navigate = useNavigate();
  const productId = Number(params.productId);
  const product = products.find((item) => item.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>('benefits');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setQuantity(1);
    setSelectedThumb(0);
  }, [productId]);

  if (!product) {
    return <Navigate to="/shop" replace />;
  }

  const isSaved = wishlist.includes(product.id);
  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  const accordionSections = [
    {
      id: 'benefits',
      title: 'Benefits',
      content: product.benefits,
    },
    {
      id: 'care',
      title: 'Care Guide',
      content: product.care,
    },
    {
      id: 'specs',
      title: 'Specifications',
      content: [`Category: ${product.category}`, `Tag: ${product.tag}`, `In stock: ${product.stock} units`, `Reviews: ${product.reviews}`],
    },
  ];

  return (
    <div className="container section-block">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to="/shop">Shop</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to={`/shop/${product.category}`} style={{ textTransform: 'capitalize' }}>{product.category}</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="current">{product.name}</span>
      </nav>

      <div className="detail-layout">
        {/* Media Panel */}
        <div className="detail-media">
          <img
            className="detail-main-image"
            src={product.image}
            alt={product.name}
            key={selectedThumb}
          />
          <div className="detail-thumbnails">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                className={`detail-thumb${selectedThumb === i ? ' active' : ''}`}
                onClick={() => setSelectedThumb(i)}
                aria-label={`View image ${i + 1}`}
              >
                <img src={product.image} alt={`${product.name} view ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Info Panel */}
        <div className="detail-copy">
          <p className="eyebrow">{product.tag}</p>
          <h1>{product.name}</h1>

          <div className="rating-row">
            <span className="rating">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.floor(product.rating) ? '#f6b73c' : 'none'}
                  color="#f6b73c"
                />
              ))}
              &nbsp;{product.rating}
            </span>
            <span>{product.reviews} reviews</span>
          </div>

          <div className="detail-price-row">
            <strong>{currency.format(product.price)}</strong>
            {product.originalPrice && <span>{currency.format(product.originalPrice)}</span>}
          </div>

          <div className={`stock-indicator${product.stock < 10 ? ' low-stock' : ' in-stock'}`}>
            {product.stock < 10 ? `Only ${product.stock} left` : 'In stock'}
          </div>

          <p className="detail-description">{product.description}</p>

          <div className="quantity-row">
            <button
              className="qty-btn"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              <Minus size={15} />
            </button>
            <span className="qty-display">{quantity}</span>
            <button
              className="qty-btn"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
            >
              <Plus size={15} />
            </button>
          </div>

          <div className="detail-cta">
            <button
              className="button button-primary"
              onClick={() => { addToCart(product.id, quantity); navigate('/cart'); }}
            >
              Add to bag
            </button>
            <button
              className="button button-secondary"
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={isSaved}
            >
              <Heart size={15} fill={isSaved ? 'var(--terracotta)' : 'none'} color={isSaved ? 'var(--terracotta)' : 'currentColor'} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>

          <div className="delivery-info">
            <Truck size={16} />
            <span>Free delivery over ₹2,999 · Ships in 2–4 days</span>
          </div>

          {/* Accordion */}
          <div className="accordion">
            {accordionSections.map((section) => (
              <div key={section.id} className="accordion-item">
                <button
                  className="accordion-trigger"
                  onClick={() => setOpenAccordion(openAccordion === section.id ? null : section.id)}
                  aria-expanded={openAccordion === section.id}
                >
                  {section.title}
                  <ChevronDown
                    size={16}
                    style={{
                      transition: 'transform 0.25s ease',
                      transform: openAccordion === section.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      flexShrink: 0,
                    }}
                  />
                </button>
                {openAccordion === section.id && (
                  <div className="accordion-content">
                    <ul>
                      {section.content.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="related-section">
          <div className="section-header" style={{ marginBottom: '1.75rem' }}>
            <div>
              <p className="eyebrow">You may also like</p>
              <h2>From the same collection</h2>
            </div>
          </div>
          <div className="product-grid">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
                isSaved={wishlist.includes(p.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── CartPage ───────────────────────────────────────────── */
function CartPage({
  cartItems,
  cartTotal,
  updateQuantity,
  removeFromCart,
  onCheckout,
}: {
  cartItems: Array<{ productId: number; quantity: number; product: Product }>;
  cartTotal: number;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  onCheckout: () => void;
}) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 2999;
  const shipping = subtotal > freeShippingThreshold ? 0 : 149;
  const total = subtotal + shipping;

  return (
    <div className="container section-block">
      <div className="cart-page-header">
        <p className="eyebrow">Your Bag</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,3vw,2.8rem)' }}>
          {cartItems.length === 0 ? 'Your bag is empty' : `${cartItems.reduce((s, i) => s + i.quantity, 0)} item${cartItems.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}`}
        </h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-emoji">🛍️</span>
          <h3>Nothing here yet</h3>
          <p>Looks like you haven't added any plants to your bag. Let's fix that.</p>
          <Link to="/shop" className="button button-primary">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map(({ product, quantity, productId }) => (
              <div key={productId} className="cart-item">
                <img src={product.image} alt={product.name} />
                <div className="cart-item-copy">
                  <Link to={`/product/${product.id}`} className="product-name">
                    {product.name}
                  </Link>
                  <p>{product.category} · {product.tag}</p>
                </div>
                <div className="cart-qty-row">
                  <button
                    className="cart-qty-btn"
                    onClick={() => updateQuantity(productId, quantity - 1)}
                    aria-label={`Decrease ${product.name} quantity`}
                  >
                    <Minus size={13} />
                  </button>
                  <span className="cart-qty-display">{quantity}</span>
                  <button
                    className="cart-qty-btn"
                    onClick={() => updateQuantity(productId, quantity + 1)}
                    aria-label={`Increase ${product.name} quantity`}
                  >
                    <Plus size={13} />
                  </button>
                </div>
                <strong className="cart-item-price">{currency.format(product.price * quantity)}</strong>
                <button className="text-button" onClick={() => removeFromCart(productId)}>
                  Remove
                </button>
              </div>
            ))}
            <Link to="/shop" className="continue-link">
              <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Continue shopping
            </Link>
          </div>

          <aside className="summary-panel">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{currency.format(subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <strong>{shipping === 0 ? 'Free' : currency.format(shipping)}</strong>
            </div>
            {subtotal < freeShippingThreshold && (
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0.5rem 0' }}>
                Add {currency.format(freeShippingThreshold - subtotal)} more for free shipping
              </p>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <strong>{currency.format(total)}</strong>
            </div>
            <div className="promo-row">
              <input type="text" className="promo-input" placeholder="Promo code" aria-label="Promo code" />
              <button className="button button-secondary" style={{ padding: '0.65rem 1rem', fontSize: '0.82rem' }}>
                Apply
              </button>
            </div>
            <div className="summary-actions">
              <Link to="/checkout" className="button button-primary full-width">
                Proceed to Checkout
              </Link>
              <button className="button button-secondary full-width" onClick={onCheckout}>
                Place mock order
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

/* ─── WishlistPage ───────────────────────────────────────── */
function WishlistPage({
  wishlistItems,
  addToCart,
  toggleWishlist,
}: {
  wishlistItems: Product[];
  addToCart: (productId: number, quantity?: number) => void;
  toggleWishlist: (productId: number) => void;
}) {
  return (
    <div className="container section-block">
      <div className="wishlist-header">
        <p className="eyebrow">Saved Plants</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,3vw,2.8rem)' }}>
          Your Wishlist
        </h1>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-emoji">🌿</span>
          <h3>No saved plants yet</h3>
          <p>Browse the collection and tap the heart icon to save plants you love.</p>
          <Link to="/shop" className="button button-primary">
            Explore collection
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {wishlistItems.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              toggleWishlist={toggleWishlist}
              isSaved
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── CheckoutPage ───────────────────────────────────────── */
function CheckoutPage({
  cartItems,
  cartTotal,
  onComplete,
}: {
  cartItems: Array<{ productId: number; quantity: number; product: Product }>;
  cartTotal: number;
  onComplete: () => void;
}) {
  const total = cartTotal + (cartTotal > 2999 ? 0 : 149);
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <div className="container section-block">
      <p className="eyebrow">Secure Checkout</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,3vw,2.8rem)', marginBottom: '2rem' }}>
        Complete Your Order
      </h1>
      <div className="checkout-layout">
        <div>
          {/* Contact */}
          <div className="checkout-form-section">
            <p className="checkout-section-title">Contact Information</p>
            <div className="checkout-form">
              <div className="form-group">
                <label htmlFor="co-name">Full name</label>
                <input id="co-name" type="text" defaultValue="Maya Stewart" />
              </div>
              <div className="form-group">
                <label htmlFor="co-email">Email</label>
                <input id="co-email" type="email" defaultValue="maya@verdantnursery.com" />
              </div>
              <div className="form-group">
                <label htmlFor="co-phone">Phone</label>
                <input id="co-phone" type="tel" defaultValue="+91 98765 43210" />
              </div>
            </div>
          </div>
          {/* Delivery */}
          <div className="checkout-form-section">
            <p className="checkout-section-title">Delivery Address</p>
            <div className="checkout-form">
              <div className="form-group">
                <label htmlFor="co-address">Street address</label>
                <input id="co-address" type="text" defaultValue="14 MG Road, Indiranagar" />
              </div>
              <div className="form-two-col">
                <div className="form-group">
                  <label htmlFor="co-city">City</label>
                  <input id="co-city" type="text" defaultValue="Bangalore" />
                </div>
                <div className="form-group">
                  <label htmlFor="co-pin">PIN code</label>
                  <input id="co-pin" type="text" defaultValue="560038" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="co-state">State</label>
                <input id="co-state" type="text" defaultValue="Karnataka" />
              </div>
            </div>
          </div>
          {/* Payment */}
          <div className="checkout-form-section">
            <p className="checkout-section-title">Payment</p>
            <div className="demo-badge">Demo checkout — no payment will be processed</div>
            <div className="payment-box">
              <CreditCard size={18} />
              <span>Visa ending in 2048</span>
            </div>
          </div>
        </div>

        <aside className="summary-panel">
          <h3>Order Summary</h3>
          {cartItems.map(({ product, quantity }) => (
            <div key={product.id} className="summary-row">
              <span>{product.name} × {quantity}</span>
              <strong>{currency.format(product.price * quantity)}</strong>
            </div>
          ))}
          <div className="summary-row">
            <span>Shipping</span>
            <strong>{cartTotal > 2999 ? 'Free' : currency.format(149)}</strong>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>{currency.format(total)}</strong>
          </div>
          <button
            className="button button-primary full-width"
            style={{ marginTop: '1.25rem' }}
            onClick={() => { onComplete(); navigate('/orders'); }}
          >
            Place Order
          </button>
        </aside>
      </div>
    </div>
  );
}

/* ─── OrdersPage ─────────────────────────────────────────── */
function OrdersPage({ orders }: { orders: Order[] }) {
  const statusClass = (status: string) => {
    if (status === 'Delivered') return 'delivered';
    if (status === 'Shipped') return 'shipped';
    return 'processing';
  };

  return (
    <div className="container section-block">
      <p className="eyebrow">Recent Activity</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,3vw,2.8rem)', marginBottom: '2rem' }}>
        Your Orders
      </h1>
      {orders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-emoji">📦</span>
          <h3>No orders yet</h3>
          <p>Once you place an order, it will appear here.</p>
          <Link to="/shop" className="button button-primary">Start shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <div className="order-id">{order.id}</div>
                  <div className="order-date">{order.date}</div>
                </div>
                <span className={`status-pill ${statusClass(order.status)}`}>{order.status}</span>
              </div>
              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item} className="order-item-name">{item}</div>
                ))}
              </div>
              <div className="order-total">
                <span>Order total</span>
                <strong>{currency.format(order.total)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── AuthPage ───────────────────────────────────────────── */
function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  return (
    <div className="container" style={{ padding: '3rem 2rem' }}>
      <div className="auth-layout">
        <div className="auth-visual">
          <img
            src="https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=900&q=80"
            alt="Botanical lifestyle"
          />
          <div className="auth-visual-overlay">
            <p className="auth-quote">"Tending plants is an act of hope."</p>
            <p className="auth-quote-attr">— Verdant Plant Studio</p>
          </div>
        </div>
        <div className="auth-form-panel">
          <div className="auth-inner">
            <p className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Join Verdant'}</p>
            <h2>{mode === 'login' ? 'Login to your account' : 'Create your account'}</h2>
            <p>Track orders, save favourites, and receive plant care updates.</p>
            <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
              {mode === 'register' && (
                <label>
                  Full name
                  <input type="text" placeholder="Your name" autoComplete="name" />
                </label>
              )}
              <label>
                Email
                <input type="email" placeholder="you@example.com" autoComplete="email" />
              </label>
              <label>
                Password
                <input type="password" placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              </label>
              <button className="button button-primary full-width" type="button">
                {mode === 'login' ? 'Login' : 'Create Account'}
              </button>
              <p className="auth-footnote">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <Link to={mode === 'login' ? '/register' : '/login'}>
                  {mode === 'login' ? 'Register' : 'Login'}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ProfilePage ────────────────────────────────────────── */
function ProfilePage({
  profile,
  setProfile,
}: {
  profile: UserProfile;
  setProfile: (next: UserProfile) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  const saveProfile = () => {
    setProfile(draft);
    setIsEditing(false);
  };

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="container section-block">
      <div className="profile-layout">
        <div className="profile-sheet">
          <div className="profile-header">
            <div className="avatar-circle">{initials}</div>
            <div>
              <p className="eyebrow">Account</p>
              <h2>{profile.name}</h2>
            </div>
          </div>
          <div className="profile-body">
            {!isEditing ? (
              <div className="profile-meta">
                <div className="profile-field">
                  <span className="profile-field-label">Email</span>
                  <span className="profile-field-value">{profile.email}</span>
                </div>
                <div className="profile-field">
                  <span className="profile-field-label">Location</span>
                  <span className="profile-field-value">{profile.location}</span>
                </div>
                <div className="profile-actions">
                  <button
                    className="button button-primary"
                    onClick={() => { setDraft(profile); setIsEditing(true); }}
                  >
                    Edit profile
                  </button>
                </div>
                <div className="profile-links">
                  <Link to="/orders" className="profile-link-card">
                    <Package size={18} /> My Orders
                  </Link>
                  <Link to="/wishlist" className="profile-link-card">
                    <Heart size={18} /> Wishlist
                  </Link>
                </div>
              </div>
            ) : (
              <div className="profile-form">
                <label>
                  Name
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                </label>
                <label>
                  Email
                  <input
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  />
                </label>
                <label>
                  Location
                  <input
                    value={draft.location}
                    onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  />
                </label>
                <div className="profile-form-actions">
                  <button className="button button-primary" onClick={saveProfile}>Save changes</button>
                  <button className="button button-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Footer ─────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="brand" style={{ marginBottom: '1rem' }}>
              <LeafEmblem className="brand-emblem" />
              <div className="brand-text">
                <span className="brand-name">Verdant</span>
                <span className="brand-sub">Plant Studio</span>
              </div>
            </div>
            <p>Premium botanical plants sourced from small nurseries. Grown with care, delivered with intention.</p>
            <p className="footer-copy">© 2024 Verdant Plant Studio. All rights reserved.</p>
          </div>

          {/* Shop Links */}
          <div>
            <p className="footer-col-title">Shop</p>
            <div className="footer-links">
              <Link to="/shop">All Plants</Link>
              <Link to="/shop/indoor">Indoor</Link>
              <Link to="/shop/low-light">Low Light</Link>
              <Link to="/shop/pet-friendly">Pet Friendly</Link>
              <Link to="/shop/gifts">Gift Sets</Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <p className="footer-col-title">Support</p>
            <div className="footer-links">
              <Link to="/orders">Care Guides</Link>
              <Link to="/orders">Shipping & Returns</Link>
              <Link to="/orders">Contact Us</Link>
              <Link to="/orders">FAQ</Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <p className="footer-col-title">Stay in the loop</p>
            <p style={{ color: 'rgba(167,184,155,0.65)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Plant care tips, seasonal arrivals and exclusive offers.
            </p>
            <div className="footer-newsletter-form">
              <input
                className="footer-newsletter-input"
                type="email"
                placeholder="your@email.com"
                aria-label="Email for newsletter"
              />
              <button className="footer-newsletter-btn" type="button">Subscribe</button>
            </div>
            <div className="footer-social">
              <a href="#" aria-label="Follow on Instagram"><Instagram size={16} /></a>
              <a href="#" aria-label="Follow on Pinterest" style={{ fontWeight: 700, fontSize: '0.82rem' }}>P</a>
              <a href="#" aria-label="Follow on Twitter" style={{ fontWeight: 700, fontSize: '0.82rem' }}>𝕏</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Plants grown with care. Delivered with intention.</p>
        </div>
      </div>
    </footer>
  );
}

export default App;
