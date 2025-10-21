# System Architecture

## Overview

The Price Comparison Dashboard is a web-based application that enables users to search for products across multiple retailers and view price comparisons with verified, working links. The system ensures all displayed links are validated through automated integrity checks.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │        Web Browser (HTML/CSS/JavaScript)              │  │
│  │  - Search form                                        │  │
│  │  - Results display with verification badges           │  │
│  │  - Best deal highlighting                             │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP Requests
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Flask Web Server                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  app.py - Main Application                           │  │
│  │  ├─ GET  /          → Dashboard page                 │  │
│  │  ├─ POST /search    → Product search API             │  │
│  │  ├─ POST /verify-link → Link verification API        │  │
│  │  └─ GET  /health    → Health check                   │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ Function Calls
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Scraper Module                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  scraper.py - Price Scraper & Link Verifier         │  │
│  │  ├─ search_product()  → Find deals across retailers  │  │
│  │  ├─ verify_link()     → Check link accessibility     │  │
│  │  └─ get_best_deal()   → Identify best price          │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP Requests
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                External Retailer Sites                       │
│  • Amazon      • eBay       • Walmart                        │
│  • Best Buy    • Target                                      │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend (User Interface)

**Files:**
- `templates/index.html` - Main dashboard template
- `static/css/style.css` - Styling and responsive design

**Responsibilities:**
- Display search interface
- Show loading states during searches
- Render search results with verification badges
- Highlight best deals
- Handle user interactions

**Key Features:**
- Responsive grid layout for results
- Color-coded verification status (green = verified, orange = unverified)
- Real-time search with async JavaScript
- Error message display
- Mobile-friendly design

### 2. Backend (Flask Application)

**File:** `app.py`

**Routes:**

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Serves the main dashboard HTML |
| `/search` | POST | Accepts search query, returns product results |
| `/verify-link` | POST | Verifies a specific URL |
| `/health` | GET | Health check endpoint |

**Request/Response Format:**

Search Request:
```json
{
  "query": "laptop"
}
```

Search Response:
```json
{
  "success": true,
  "query": "laptop",
  "results": [...],
  "best_deal": {...},
  "total_results": 5,
  "verified_results": 3
}
```

### 3. Scraper Module

**File:** `scraper.py`

**Class:** `PriceScraper`

**Methods:**

1. **`verify_link(url)`**
   - Purpose: Verify link accessibility
   - Process:
     1. Send HTTP HEAD request
     2. If HEAD fails (405), try GET request
     3. Check status code (200 = valid)
     4. Handle timeouts and connection errors
   - Returns: Verification status with details

2. **`search_product(query)`**
   - Purpose: Search for products across retailers
   - Process:
     1. Generate search URLs for each retailer
     2. Verify each retailer's base URL
     3. Create result objects with prices
     4. Mark verification status
     5. Sort by verified status and price
   - Returns: List of product results

3. **`get_best_deal(results)`**
   - Purpose: Find the best verified deal
   - Process:
     1. Filter for verified results
     2. Find minimum price
   - Returns: Best deal object or None

## Data Flow

### Search Process

1. **User Input**
   - User enters product name in search box
   - Clicks "Search" button

2. **Frontend Processing**
   - JavaScript captures form submission
   - Sends POST request to `/search` endpoint
   - Shows loading indicator

3. **Backend Processing**
   - Flask receives search request
   - Calls `scraper.search_product(query)`
   - Scraper generates retailer URLs
   - Verifies each link
   - Compiles results with verification status

4. **Response Generation**
   - Identifies best deal
   - Returns JSON with all results and metadata

5. **Frontend Display**
   - Receives JSON response
   - Renders product cards
   - Shows verification badges
   - Highlights best deal (if found)

## Link Verification Process

```
Start
  ↓
Send HTTP HEAD request to URL
  ↓
Status Code?
  ├─ 200 → ✅ Valid
  ├─ 405 → Try GET request
  │         ↓
  │    Status Code?
  │      ├─ 200 → ✅ Valid
  │      └─ Other → ❌ Invalid
  ├─ Other → ❌ Invalid
  ↓
Timeout/Error?
  ├─ Yes → ❌ Invalid (with error message)
  └─ No → Return status
```

## Security Considerations

1. **Input Validation**
   - Search queries are validated for non-empty strings
   - URLs are validated before verification

2. **Request Timeouts**
   - 10-second timeout for link verification
   - Prevents hanging requests

3. **Error Handling**
   - Try-catch blocks for all external requests
   - Graceful degradation when links fail

4. **User Agent**
   - Proper User-Agent header to identify requests
   - Complies with web scraping best practices

## Scalability Considerations

**Current Implementation:**
- Synchronous link verification
- In-memory data storage
- Single-threaded Flask server

**Future Enhancements:**
1. **Async Processing**
   - Use asyncio for parallel link verification
   - Reduce response time for searches

2. **Caching**
   - Cache verification results (TTL: 1 hour)
   - Store recent search results

3. **Database Integration**
   - Store historical price data
   - Track price trends over time

4. **API Integration**
   - Replace scraping with official APIs
   - More reliable and faster data access

5. **Queue System**
   - Background job processing for slow operations
   - Webhook notifications for completed searches

## Testing

**Manual Testing:**
- Dashboard loads correctly
- Search functionality works
- Results display with proper formatting
- Link verification status shown accurately

**API Testing:**
```bash
# Test search endpoint
curl -X POST http://localhost:5000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "laptop"}'

# Test health endpoint
curl http://localhost:5000/health
```

## Deployment

**Development:**
```bash
python app.py
```

**Production Recommendations:**
1. Use Gunicorn or uWSGI
2. Configure Nginx as reverse proxy
3. Enable HTTPS
4. Set up monitoring and logging
5. Use environment variables for configuration

**Example with Gunicorn:**
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Maintenance

**Regular Tasks:**
1. Monitor link verification success rates
2. Update retailer URLs if changed
3. Review error logs
4. Update dependencies for security patches

**Monitoring Metrics:**
- Average search response time
- Link verification success rate
- Error rate per endpoint
- User search patterns
