import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import '../App.css';

const STATIC_CATEGORIES = ['All', 'Computers', 'Phones', 'Home', 'Gaming', 'Appliances', 'Fashion', 'More'];

const normalizeDeal = deal => ({
  ...deal,
  originalPrice: deal.originalPrice ?? deal.original_price ?? deal.list_price ?? deal.price,
  productUrl: deal.productUrl ?? deal.product_url ?? '#',
  postedBy: deal.postedBy ?? deal.posted_by ?? 'team',
  postedDate: deal.postedDate ?? deal.posted_date ?? deal.created_at,
});

const formatCurrency = amount => {
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) {
    return '$0';
  }
  return `$${numeric.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const getRetailerFromUrl = url => {
  if (!url || url === '#') return 'Direct';
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    const root = hostname.split('.')[0];
    return root.charAt(0).toUpperCase() + root.slice(1);
  } catch (err) {
    return 'Direct';
  }
};

const timeSince = dateString => {
  if (!dateString) return 'Just now';
  const posted = new Date(dateString);
  if (Number.isNaN(posted.getTime())) return 'Just now';
  const diffHours = Math.floor((Date.now() - posted.getTime()) / (1000 * 60 * 60));
  if (diffHours <= 0) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

function Home() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Show success message if redirected from post deal
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setError(null);
        const response = await axios.get('/api/deals');
        setDeals(response.data.map(normalizeDeal));
      } catch (err) {
        console.error('Error fetching deals:', err);
        setError(err.response?.data?.error || 'Failed to load deals. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const categories = useMemo(() => {
    const dynamicCats = Array.from(new Set(deals.map(deal => deal.category))).filter(Boolean);
    const merged = STATIC_CATEGORIES.slice();
    dynamicCats.forEach(cat => {
      if (!merged.includes(cat)) {
        merged.splice(merged.length - 1, 0, cat);
      }
    });
    return merged;
  }, [deals]);

  const displayedDeals = useMemo(() => {
    let results = deals;
    if (selectedCategory !== 'All') {
      results = results.filter(deal => deal.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      results = results.filter(deal =>
        [deal.title, deal.description, deal.category, deal.postedBy]
          .filter(Boolean)
          .some(value => value.toLowerCase().includes(lower))
      );
    }

    // Sort results
    results = [...results];
    switch (sortBy) {
      case 'price-asc':
        results.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        results.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'oldest':
        results.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
        break;
      case 'newest':
      default:
        results.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
        break;
    }

    return results;
  }, [deals, selectedCategory, searchTerm, sortBy]);

  if (loading) {
    return (
      <div className="app-shell loading-state">
        <LoadingSpinner message="Loading deals..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell loading-state">
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😕</div>
          <h2 style={{ marginBottom: '12px' }}>Oops!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand-section">
          <div className="brand">
            <span className="brand__name">Boole Deals</span>
          </div>
          <nav className="main-nav">
            <button type="button" className="nav-item nav-item--active" onClick={() => navigate('/')}>Home</button>
            {user ? (
              <button type="button" className="nav-item" onClick={logout}>Logout ({user.username})</button>
            ) : (
              <button type="button" className="nav-item" onClick={() => navigate('/login')}>Login</button>
            )}
          </nav>
        </div>

        <div className="search-input">
          <input
            type="search"
            placeholder="Search deals..."
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/post-deal')}
          >
            Post a deal
          </button>
        </div>
      </header>

      {successMessage && (
        <div className="success-banner">
          {successMessage}
        </div>
      )}

      <section className="categories-row">
        <div className="pill-row" role="tablist">
          {categories.map(category => (
            <button
              type="button"
              key={category}
              role="tab"
              aria-selected={selectedCategory === category}
              className={selectedCategory === category ? 'pill pill--active' : 'pill'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="deals-section">
        <header className="section-header">
          <div>
            <p className="eyebrow">Top Deals</p>
            <span className="subtext">Updated hourly</span>
          </div>
          <div className="sort-container">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
              aria-label="Sort deals"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="price-asc">Sort: Price Low</option>
              <option value="price-desc">Sort: Price High</option>
            </select>
          </div>
        </header>

        <div className="deal-list">
          {displayedDeals.length === 0 && (
            <p className="empty-state">No deals found for the selected filters.</p>
          )}
          {displayedDeals.map(deal => (
            <article key={deal.id} className="deal-card">
              <div
                className="deal-card__image-placeholder"
                onClick={() => navigate(`/deals/${deal.id}`)}
                style={{ cursor: 'pointer' }}
              />
              <div
                className="deal-card__content"
                onClick={() => navigate(`/deals/${deal.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <h3>{deal.title} — {formatCurrency(deal.price)} ({getRetailerFromUrl(deal.productUrl)})</h3>
                <div className="deal-meta">
                  <span>{getRetailerFromUrl(deal.productUrl)}</span>
                  <span>• {timeSince(deal.postedDate)}</span>
                  {deal.postedBy && <span>• @{deal.postedBy}</span>}
                </div>
              </div>
              <div className="deal-card__cta">
                <button className="btn-icon-circle" aria-label="Save deal" />
                <a
                  className="btn btn-ghost"
                  href={deal.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <span>©2025 Boole Dragon</span>
        <span>-</span>
        <a href="/" aria-label="About">About</a>
        <span>-</span>
        <a href="/" aria-label="Terms">Terms</a>
        <span>-</span>
        <a href="/" aria-label="Privacy">Privacy</a>
      </footer>
    </div>
  );
}

export default Home;
