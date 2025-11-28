# Source - https://stackoverflow.com/a
# Posted by Daniel Morgan, modified by community. See post 'Timeline' for change history
# Retrieved 2025-11-28, License - CC BY-SA 4.0

from urllib import response
import pandas as pd
import requests
from dotenv import load_dotenv
import os
import time
from datetime import datetime, timedelta


# Load environment variables from .env file
load_dotenv()

# Get your API key from .env
api_key = os.getenv('AQICN_API_KEY')  # or whatever your API key is called in .env

if not api_key:
    print("API key not found in .env file")
    exit()


url1 = 'https://api.waqi.info'
# Get token from:- https://aqicn.org/data-platform/token/#/
token = api_key
box = '54.891,10.849,69.058,24.174' 
url2=f'/map/bounds/?latlng={box}&token={token}'
my_data = pd.read_json(url1 + url2) 

all_rows = []
for each_row in my_data['data']:
    if 'Sweden' in each_row['station']['name']:
        all_rows.append([each_row['station']['name'],each_row['lat'],each_row['lon'],each_row['aqi']])
        df = pd.DataFrame(all_rows,columns=['station_name', 'lat', 'lon', 'aqi'])


print(df)

import os
import time
from datetime import datetime, timedelta

# Create historical folder if it doesn't exist
if not os.path.exists('historical'):
    os.makedirs('historical')


def get_station_historical_data(station_uid, station_name, days_back=30):
    """Get historical data for a specific station and save as CSV"""
    print(f"Fetching historical data for {station_name} (ID: {station_uid})...")
    
    historical_data = []
    url = f"https://api.waqi.info/feed/@{station_uid}/?token={api_key}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if data['status'] == 'ok':
            # Safely get values from iaqi
            iaqi = data['data'].get('iaqi', {})
            
            current_data = {
                'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
                'station_id': station_uid,
                'station_name': station_name,
                'aqi': data['data'].get('aqi', None),
                'pm25': iaqi.get('pm25', {}).get('v', None) if isinstance(iaqi.get('pm25'), dict) else None,
                'pm10': iaqi.get('pm10', {}).get('v', None) if isinstance(iaqi.get('pm10'), dict) else None,
                'o3': iaqi.get('o3', {}).get('v', None) if isinstance(iaqi.get('o3'), dict) else None,
                'no2': iaqi.get('no2', {}).get('v', None) if isinstance(iaqi.get('no2'), dict) else None,
                'so2': iaqi.get('so2', {}).get('v', None) if isinstance(iaqi.get('so2'), dict) else None,
                'co': iaqi.get('co', {}).get('v', None) if isinstance(iaqi.get('co'), dict) else None
            }
            historical_data.append(current_data)
            
            # Save to CSV
            if historical_data:
                df_historical = pd.DataFrame(historical_data)
                filename = f"historical/station_{station_uid}_{station_name.replace(' ', '_').replace(',', '')}.csv"
                df_historical.to_csv(filename, index=False)
                print(f"  Saved {len(historical_data)} records to {filename}")
                return len(historical_data)
            
    except Exception as e:
        print(f"  Error fetching data for station {station_uid}: {e}")
        return 0
    
    time.sleep(1)
    return 0

# Process all stations from your existing data
total_saved = 0
for each_row in my_data['data']:
    station_name = each_row['station']['name']
    if 'sweden' in station_name.lower():  # Filter for Sweden stations
        station_uid = each_row['uid']
        saved_count = get_station_historical_data(station_uid, station_name)
        total_saved += saved_count

print(f"\nCompleted! Saved historical data for {total_saved} total records.")