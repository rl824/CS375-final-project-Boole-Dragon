import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './DealDetail.css';

const CATEGORIES = ['Computers', 'Phones', 'Home', 'Gaming', 'Appliances', 'Fashion', 'Other'];

const timeSince = dateString => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }

  return 'just now';
};

const formatCurrency = amount => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const getRetailerFromUrl = url => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '').split('.')[0];
  } catch {
    return 'Unknown';
  }
};

const calculateSavings = (originalPrice, price) => {
  if (!originalPrice || originalPrice <= price) return null;
  const savings = originalPrice - price;
  const percentage = Math.round((savings / originalPrice) * 100);
  return { amount: savings, percentage };
};

function DealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    productUrl: '',
    category: '',
  });

  const fetchDeal = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/deals/${id}`);
      setDeal(response.data);
      setEditForm({
        title: response.data.title,
        description: response.data.description || '',
        price: response.data.price,
        originalPrice: response.data.original_price || '',
        productUrl: response.data.product_url,
        imageUrl: response.data.image_url || '',
        category: response.data.category || '',
      });
    } catch (err) {
      console.error('Error fetching deal:', err);
      setError(err.response?.data?.error || 'Failed to load deal');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.put(`/api/deals/${id}`, {
        title: editForm.title,
        description: editForm.description,
        price: parseFloat(editForm.price),
        originalPrice: editForm.originalPrice ? parseFloat(editForm.originalPrice) : null,
        productUrl: editForm.productUrl,
        imageUrl: editForm.imageUrl,
        category: editForm.category,
      });

      setDeal({ ...deal, ...response.data.deal });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating deal:', err);
      setError(err.response?.data?.error || 'Failed to update deal');
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/deals/${id}`);
      navigate('/', { state: { message: 'Deal deleted successfully' } });
    } catch (err) {
      console.error('Error deleting deal:', err);
      setError(err.response?.data?.error || 'Failed to delete deal');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="deal-detail-container">
        <LoadingSpinner message="Loading deal..." size="large" />
      </div>
    );
  }

  if (error && !deal) {
    return (
      <div className="deal-detail-container">
        <div className="error-state">
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😕</div>
          <h2 style={{ marginBottom: '12px' }}>Oops!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user && deal && user.id === deal.user_id;
  const savings = calculateSavings(deal?.original_price, deal?.price);

  return (
    <div className="deal-detail-container">
      <div className="deal-detail-card">
        <div className="deal-detail-header">
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Back
          </button>
          {isOwner && !isEditing && (
            <div className="deal-actions">
              <button className="btn btn-ghost" onClick={() => setIsEditing(true)}>
                Edit
              </button>
              <button
                className="btn btn-ghost"
                style={{ color: '#ef4444' }}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {error && deal && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="edit-form">
            <h2>Edit Deal</h2>

            <div className="form-group">
              <label>
                Title <span className="required">*</span>
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
                maxLength={1000}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Current Price <span className="required">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Original Price (optional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.originalPrice}
                  onChange={(e) => setEditForm({ ...editForm, originalPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Product URL <span className="required">*</span>
              </label>
              <input
                type="url"
                value={editForm.productUrl}
                onChange={(e) => setEditForm({ ...editForm, productUrl: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                value={editForm.imageUrl}
                onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="deal-content">
            <div
              className="deal-image-placeholder"
              style={{
                backgroundImage: deal.image_url ? `url(${deal.image_url})` : 'none',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: deal.image_url ? '#fff' : 'var(--surface-elevated)'
              }}
            />

            <div className="deal-info">
              <div className="deal-category-badge">
                {deal.category || 'Uncategorized'}
              </div>

              <h1 className="deal-title">{deal.title}</h1>

              <div className="deal-meta">
                <span className="deal-retailer">{getRetailerFromUrl(deal.product_url)}</span>
                <span>•</span>
                <span>{timeSince(deal.created_at)}</span>
                {deal.posted_by && (
                  <>
                    <span>•</span>
                    <span>Posted by @{deal.posted_by}</span>
                  </>
                )}
              </div>

              <div className="deal-pricing">
                <div className="current-price">
                  <span className="price-label">Current Price</span>
                  <span className="price-value">{formatCurrency(deal.price)}</span>
                </div>

                {deal.original_price && (
                  <div className="original-price">
                    <span className="price-label">Original Price</span>
                    <span className="price-value strikethrough">
                      {formatCurrency(deal.original_price)}
                    </span>
                  </div>
                )}

                {savings && (
                  <div className="savings-badge">
                    Save {formatCurrency(savings.amount)} ({savings.percentage}% off)
                  </div>
                )}
              </div>

              {deal.description && (
                <div className="deal-description">
                  <h3>Description</h3>
                  <p>{deal.description}</p>
                </div>
              )}

              <div className="deal-cta">
                <a
                  href={deal.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  View Deal →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Deal?</h3>
            <p>Are you sure you want to delete this deal? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: '#ef4444' }}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LoadingSpinner size="small" message="" />
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DealDetail;
