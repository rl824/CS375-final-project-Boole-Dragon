import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PostDeal.css';

function PostDeal() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    productUrl: '',
    category: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.title || !formData.price || !formData.productUrl) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/deals', {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        productUrl: formData.productUrl,
        category: formData.category || null,
      });

      navigate('/', { state: { message: 'Deal posted successfully!' } });
    } catch (err) {
      console.error('Post deal error:', err);
      setError(err.response?.data?.error || 'Failed to post deal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-deal-container">
      <div className="post-deal-card">
        <div className="post-deal-header">
          <h1>Post a New Deal</h1>
          <p>Share an amazing deal with the community</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="post-deal-form">
          <div className="form-group">
            <label htmlFor="title">
              Deal Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Samsung Galaxy S24 - 50% Off"
              maxLength="255"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details about the deal..."
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">
                Current Price <span className="required">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="299.99"
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="originalPrice">Original Price</label>
              <input
                type="number"
                id="originalPrice"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="599.99"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="productUrl">
              Product URL <span className="required">*</span>
            </label>
            <input
              type="url"
              id="productUrl"
              name="productUrl"
              value={formData.productUrl}
              onChange={handleChange}
              required
              placeholder="https://www.amazon.com/..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select a category</option>
              <option value="Computers">Computers</option>
              <option value="Phones">Phones</option>
              <option value="Home">Home</option>
              <option value="Gaming">Gaming</option>
              <option value="Appliances">Appliances</option>
              <option value="Fashion">Fashion</option>
              <option value="Electronics">Electronics</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Posting...' : 'Post Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostDeal;
