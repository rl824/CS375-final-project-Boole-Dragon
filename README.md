# CS375 Final Project - Price Comparison Dashboard

A web-based dashboard that allows users to search and view the best price deals from various online retailers. Every result includes automated link integrity checks to ensure users only see working, verified links.

## Features

- 🔍 **Smart Product Search**: Search for products across multiple retailers
- ✅ **Automated Link Verification**: Every link is verified before being displayed
- 🏆 **Best Deal Highlighting**: The best verified deal is automatically highlighted
- 🎯 **Real-time Results**: Get instant price comparisons
- 🔒 **Secure and Reliable**: Only working links are shown to users

## Technology Stack

- **Backend**: Python Flask
- **Web Scraping**: BeautifulSoup4, Requests
- **Frontend**: HTML5, CSS3, JavaScript
- **Link Verification**: Automated HTTP checks

## Installation

1. Clone the repository:
```bash
git clone https://github.com/rl824/CS375-final-project-Boole-Dragon.git
cd CS375-final-project-Boole-Dragon
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

1. Start the Flask application:
```bash
python app.py
```

2. Open your web browser and navigate to:
```
http://localhost:5000
```

3. Enter a product name in the search box (e.g., "laptop", "headphones", "coffee maker")

4. Click "Search" to view price comparisons from multiple retailers

5. View results with:
   - Price information
   - Retailer name
   - Link verification status
   - Direct links to product pages
   - Highlighted best deal

## How It Works

### Price Scraper
The `scraper.py` module handles:
- Product search across multiple retailers
- Link integrity verification using HTTP HEAD/GET requests
- Price comparison and sorting
- Identification of best deals

### Link Verification
Each link is verified through:
1. Initial HEAD request to check availability
2. Fallback GET request if HEAD is not allowed
3. Status code validation (200 = valid)
4. Timeout and connection error handling
5. Results marked as verified/unverified

### Web Dashboard
The Flask application (`app.py`) provides:
- Main dashboard route (`/`)
- Search API endpoint (`/search`)
- Link verification endpoint (`/verify-link`)
- Health check endpoint (`/health`)

## API Endpoints

### Search Products
```
POST /search
Content-Type: application/json

{
    "query": "laptop"
}
```

Response:
```json
{
    "success": true,
    "query": "laptop",
    "results": [...],
    "best_deal": {...},
    "total_results": 5,
    "verified_results": 5
}
```

### Verify Link
```
POST /verify-link
Content-Type: application/json

{
    "url": "https://example.com/product"
}
```

Response:
```json
{
    "success": true,
    "url": "https://example.com/product",
    "verification": {
        "valid": true,
        "status_code": 200,
        "message": "Link is valid and accessible"
    }
}
```

### Health Check
```
GET /health
```

Response:
```json
{
    "status": "healthy",
    "service": "Price Comparison Dashboard"
}
```

## Project Structure

```
CS375-final-project-Boole-Dragon/
├── app.py                 # Flask application
├── scraper.py             # Web scraper and link verification
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # Dashboard HTML template
├── static/
│   └── css/
│       └── style.css     # Dashboard styles
└── README.md             # This file
```

## Future Enhancements

- Integration with real e-commerce APIs
- User accounts and saved searches
- Price history tracking
- Email alerts for price drops
- Advanced filtering options
- Mobile app version

## License

This project is for educational purposes as part of CS375 coursework.

## Contributors

- Boole Dragon Team
