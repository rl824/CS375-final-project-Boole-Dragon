"""
Flask web application for price comparison dashboard.
"""
from flask import Flask, render_template, request, jsonify
from scraper import PriceScraper

app = Flask(__name__)
scraper = PriceScraper()


@app.route('/')
def index():
    """Render the main dashboard page."""
    return render_template('index.html')


@app.route('/search', methods=['POST'])
def search():
    """
    Handle product search requests.
    
    Returns:
        JSON response with search results and verification status
    """
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({
                'error': 'Please enter a search query'
            }), 400
        
        # Perform the search
        results = scraper.search_product(query)
        
        # Get the best deal
        best_deal = scraper.get_best_deal(results)
        
        return jsonify({
            'success': True,
            'query': query,
            'results': results,
            'best_deal': best_deal,
            'total_results': len(results),
            'verified_results': len([r for r in results if r['verified']])
        })
        
    except Exception as e:
        return jsonify({
            'error': f'An error occurred: {str(e)}'
        }), 500


@app.route('/verify-link', methods=['POST'])
def verify_link():
    """
    Verify a specific link.
    
    Returns:
        JSON response with verification status
    """
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({
                'error': 'Please provide a URL to verify'
            }), 400
        
        # Verify the link
        verification = scraper.verify_link(url)
        
        return jsonify({
            'success': True,
            'url': url,
            'verification': verification
        })
        
    except Exception as e:
        return jsonify({
            'error': f'An error occurred: {str(e)}'
        }), 500


@app.route('/health')
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'Price Comparison Dashboard'
    })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
