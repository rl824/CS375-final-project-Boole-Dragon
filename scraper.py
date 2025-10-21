"""
Web scraper module for price comparison with link integrity verification.
"""
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time


class PriceScraper:
    """Scraper for finding product prices from various online retailers."""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.timeout = 10
    
    def verify_link(self, url):
        """
        Verify that a link is valid and accessible.
        
        Args:
            url (str): The URL to verify
            
        Returns:
            dict: Verification result with status, status_code, and message
        """
        try:
            response = self.session.head(url, timeout=self.timeout, allow_redirects=True)
            
            # Check if the response is successful
            if response.status_code == 200:
                return {
                    'valid': True,
                    'status_code': response.status_code,
                    'message': 'Link is valid and accessible',
                    'final_url': response.url
                }
            elif response.status_code == 405:  # Method Not Allowed, try GET
                response = self.session.get(url, timeout=self.timeout, allow_redirects=True)
                if response.status_code == 200:
                    return {
                        'valid': True,
                        'status_code': response.status_code,
                        'message': 'Link is valid and accessible',
                        'final_url': response.url
                    }
            
            return {
                'valid': False,
                'status_code': response.status_code,
                'message': f'Link returned status code {response.status_code}',
                'final_url': response.url
            }
            
        except requests.exceptions.Timeout:
            return {
                'valid': False,
                'status_code': None,
                'message': 'Link verification timed out',
                'final_url': url
            }
        except requests.exceptions.ConnectionError:
            return {
                'valid': False,
                'status_code': None,
                'message': 'Could not connect to the link',
                'final_url': url
            }
        except Exception as e:
            return {
                'valid': False,
                'status_code': None,
                'message': f'Error verifying link: {str(e)}',
                'final_url': url
            }
    
    def search_product(self, query):
        """
        Search for products and return price comparison results.
        This is a demo implementation that generates sample data.
        In a production environment, this would scrape actual e-commerce sites.
        
        Args:
            query (str): The product search query
            
        Returns:
            list: List of product results with prices and verified links
        """
        # Demo data - In production, this would scrape real e-commerce sites
        # For demonstration purposes, we'll generate sample results
        sample_retailers = [
            {
                'name': 'Amazon',
                'base_url': 'https://www.amazon.com',
                'search_path': '/s?k='
            },
            {
                'name': 'eBay',
                'base_url': 'https://www.ebay.com',
                'search_path': '/sch/i.html?_nkw='
            },
            {
                'name': 'Walmart',
                'base_url': 'https://www.walmart.com',
                'search_path': '/search?q='
            },
            {
                'name': 'Best Buy',
                'base_url': 'https://www.bestbuy.com',
                'search_path': '/site/searchpage.jsp?st='
            },
            {
                'name': 'Target',
                'base_url': 'https://www.target.com',
                'search_path': '/s?searchTerm='
            }
        ]
        
        results = []
        
        # Generate sample results with link verification
        for i, retailer in enumerate(sample_retailers):
            # Create a search URL
            search_url = f"{retailer['base_url']}{retailer['search_path']}{query.replace(' ', '+')}"
            
            # Verify the link
            verification = self.verify_link(retailer['base_url'])
            
            # Only include results with valid links
            if verification['valid']:
                # Generate a sample price (in production, this would be scraped)
                base_price = 99.99
                price = round(base_price + (i * 10) - (i * 2.5), 2)
                
                result = {
                    'retailer': retailer['name'],
                    'product_name': f"{query} - {retailer['name']} listing",
                    'price': price,
                    'currency': 'USD',
                    'url': search_url,
                    'verified': True,
                    'verification_status': verification['message'],
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
                }
                results.append(result)
            else:
                # Include the result but mark as unverified
                result = {
                    'retailer': retailer['name'],
                    'product_name': f"{query} - {retailer['name']} listing",
                    'price': 'N/A',
                    'currency': 'USD',
                    'url': search_url,
                    'verified': False,
                    'verification_status': verification['message'],
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
                }
                results.append(result)
        
        # Sort by price (verified links first, then by price)
        results.sort(key=lambda x: (not x['verified'], x['price'] if x['price'] != 'N/A' else float('inf')))
        
        return results
    
    def get_best_deal(self, results):
        """
        Find the best deal from search results.
        
        Args:
            results (list): List of search results
            
        Returns:
            dict: The best deal result or None if no verified results
        """
        verified_results = [r for r in results if r['verified'] and r['price'] != 'N/A']
        
        if not verified_results:
            return None
        
        # Return the result with the lowest price
        return min(verified_results, key=lambda x: x['price'])
