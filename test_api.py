import requests

print('Testing API connection...')
try:
    response = requests.get('http://localhost:8000/openapi.json')
    print(f'Status Code: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        print('API is working correctly!')
        print(f'Found {len(data.get("paths", {}))} API endpoints')
        print('Available endpoints:', list(data.get("paths", {}).keys()))
    else:
        print('API not responding as expected')
except Exception as e:
    print(f'Error: {e}')