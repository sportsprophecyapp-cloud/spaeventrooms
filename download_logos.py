import json
import os
import requests
import time
from urllib.parse import quote

# Load mapping
with open('team_mapping.json') as f:
    mapping = json.load(f)

BASE_DIR = 'frontend/public/logos'

HEADERS = {
    'User-Agent': 'LogoDownloader/1.0 (williamcommu@example.com) requests/2.31.0'
}

def get_wikimedia_logo(team_name):
    """
    Finds the logo for a team on Wikimedia Commons.
    We'll search for 'Category:[team_name] logos' or '[team_name] logo'
    """
    search_query = f"{team_name} logo"
    api_url = f"https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles={quote(team_name)}&pithumbsize=500"
    
    try:
        response = requests.get(api_url, headers=HEADERS).json()
        pages = response.get('query', {}).get('pages', {})
        for page_id in pages:
            page = pages[page_id]
            if 'thumbnail' in page:
                return page['thumbnail']['source']
    except Exception as e:
        print(f"Error searching for {team_name}: {e}")
    
    # Fallback to general search if direct title check fails
    search_api = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={quote(search_query)}&format=json"
    try:
        search_res = requests.get(search_api, headers=HEADERS).json()
        search_results = search_res.get('query', {}).get('search', [])
        if search_results:
            first_title = search_results[0]['title']
            # Try to get thumbnail for this title
            thumb_api = f"https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles={quote(first_title)}&pithumbsize=500"
            thumb_res = requests.get(thumb_api, headers=HEADERS).json()
            thumb_pages = thumb_res.get('query', {}).get('pages', {})
            for pid in thumb_pages:
                if 'thumbnail' in thumb_pages[pid]:
                    return thumb_pages[pid]['thumbnail']['source']
    except Exception as e:
        print(f"Error in fallback search for {team_name}: {e}")
        
    return None

def download_logo(url, filepath):
    if not url:
        return False
    try:
        res = requests.get(url, stream=True, headers=HEADERS)
        if res.status_code == 200:
            with open(filepath, 'wb') as f:
                for chunk in res.iter_content(1024):
                    f.write(chunk)
            return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
    return False

for league, teams in mapping.items():
    league_dir = os.path.join(BASE_DIR, league)
    if not os.path.exists(league_dir):
        os.makedirs(league_dir)
        
    for team_name, filename in teams:
        filepath = os.path.join(league_dir, filename)
        if os.path.exists(filepath):
            print(f"Skipping {team_name}, already exists.")
            continue
            
        print(f"Processing {team_name}...")
        logo_url = get_wikimedia_logo(team_name)
        if logo_url:
            print(f"Found URL for {team_name}: {logo_url}")
            if download_logo(logo_url, filepath):
                print(f"Successfully downloaded {team_name} logo.")
            else:
                print(f"Failed to download {team_name} logo.")
        else:
            print(f"Could not find logo for {team_name}.")
        
        # Sleep to be polite to Wikipedia API
        time.sleep(0.5)
