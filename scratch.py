import requests
from bs4 import BeautifulSoup
import re

response = requests.get('https://ncdc.go.ug/resource/')
soup = BeautifulSoup(response.content, 'html.parser')

links = []
count = 0
for link in soup.find_all('a', href=True):
    href = link['href']
    if '.pdf' in href.lower() or 'download' in href.lower():
        text = link.get_text(strip=True)
        if not text:
            # Maybe inside an image or div
            text = 'No Text'
        links.append(f"{text}: {href}")
        count += 1
        
print(f"Found {count} resources:")
for l in list(set(links))[:20]:
    print(l)
