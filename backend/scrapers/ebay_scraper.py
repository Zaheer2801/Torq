"""
eBay Motors API Integration
Scrapes vehicle listings from eBay Motors (official API)
"""
import requests
import json
import logging
from datetime import datetime
from typing import List, Dict
import re

logger = logging.getLogger(__name__)

class eBayMotorsScraper:
    """Scraper for eBay Motors API"""
    
    BASE_URL = "https://api.ebay.com/buy/browse/v1"
    
    def __init__(self, app_id: str, cert_id: str, dev_id: str):
        self.app_id = app_id
        self.cert_id = cert_id
        self.dev_id = dev_id
    
    def search_vehicles(self, 
                       make: str = None,
                       model: str = None,
                       year_min: int = None,
                       year_max: int = None,
                       category: str = "6001",  # Motorcycles
                       limit: int = 200):
        """Search eBay Motors for vehicles"""        
        try:
            url = f"{self.BASE_URL}/item_summary/search"
            
            # Build search query
            search_terms = ["cars"]
            if make:
                search_terms.append(make)
            if model:
                search_terms.append(model)
            if year_min:
                search_terms.append(f"{year_min}")
            
            q = " ".join(search_terms)
            
            params = {
                "q": q,
                "category_ids": category,
                "sort": "newlyListed",
                "limit": min(limit, 200),
                "filter": "buyingOptions:{AUCTION,FIXED_PRICE}"
            }
            
            headers = {
                "Authorization": f"Bearer {self._get_access_token()}",
                "X-EBAY-C-MARKETPLACE-ID": "EBAY_US"
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            listings = []
            
            if "itemSummaries" in data:
                for item in data["itemSummaries"]:
                    listing = self._parse_ebay_item(item)
                    if listing:
                        listings.append(listing)
            
            logger.info(f"Scraped {len(listings)} listings from eBay Motors")
            return listings
        
        except Exception as e:
            logger.error(f"Error scraping eBay Motors: {str(e)}")
            return []
    
    def _get_access_token(self):
        """Get OAuth access token from eBay"""  
        # This is a simplified version - in production, implement proper OAuth flow
        # For demo purposes, you'd use a pre-generated token or refresh token flow
        return "YOUR_EBAY_ACCESS_TOKEN"
    
    def _parse_ebay_item(self, item: Dict) -> Dict:
        """Parse eBay item into standard listing format"""        
        try:
            title = item.get("title", "")
            price = item.get("price", {})
            
            # Extract price in cents
            price_value = price.get("value", "0")
            try:
                price_cents = int(float(price_value) * 100)
            except:
                price_cents = 0
            
            # Parse vehicle info from title
            year, make, model = self._parse_vehicle_title(title)
            
            listing = {
                "source": "ebay",
                "external_id": item.get("itemId"),
                "title": title,
                "price": price_cents,
                "url": item.get("itemWebUrl"),
                "images": [img.get("imageUrl") for img in item.get("image", {}).get("imageUrl", [])],
                "category": self._categorize_vehicle(title),
                "year": year,
                "make": make,
                "model": model,
                "condition": "used" if "used" in title.lower() else "new",
                "raw_data": json.dumps(item)
            }
            
            return listing
        except Exception as e:
            logger.error(f"Error parsing eBay item: {str(e)}")
            return None
    
    def _parse_vehicle_title(self, title: str):
        """Extract year, make, model from title"""        
        # Pattern: YYYY Make Model
        pattern = r"(\d{4})\s+([A-Za-z]+)\s+([A-Za-z]+)"
        match = re.search(pattern, title)
        
        if match:
            return int(match.group(1)), match.group(2), match.group(3)
        
        return None, None, None
    
    def _categorize_vehicle(self, title: str) -> str:
        """Categorize vehicle type"""        
        title_lower = title.lower()        
        
        if any(word in title_lower for word in ["motorcycle", "harley", "sportster", "dirt bike"]):
            return "motorcycle"
        elif any(word in title_lower for word in ["truck", "f150", "silverado", "ram"]):
            return "truck"
        elif any(word in title_lower for word in ["van", "sprinter", "transit"]):
            return "van"
        elif any(word in title_lower for word in ["parts", "accessory", "part"]):
            return "part"
        else:
            return "car"

# Example usage
if __name__ == "__main__":
    scraper = eBayMotorsScraper(
        app_id="YOUR_APP_ID",
        cert_id="YOUR_CERT_ID",
        dev_id="YOUR_DEV_ID"
    )
    
    listings = scraper.search_vehicles(make="Ford", model="F150")
    print(f"Found {len(listings)} listings")
    for listing in listings[:5]:
        print(listing)