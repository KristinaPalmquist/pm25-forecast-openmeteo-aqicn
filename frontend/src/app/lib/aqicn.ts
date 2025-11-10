const TOKEN = process.env.NEXT_PUBLIC_AQICN_API_TOKEN || '';

export interface AQICNStation {
  lat: number;
  lon: number;
  aqi: string;
  station: {
    name: string;
  };
  iaqi?: {
    pm25?: { v: number };
    pm10?: { v: number };
    o3?: { v: number };
    no2?: { v: number };
    so2?: { v: number };
    co?: { v: number };
  };
}

export interface AQICNResponse {
  status: string;
  data?: AQICNStation[];
}

export async function fetchStationsInBounds(
  minLat: number,
  minLon: number,
  maxLat: number,
  maxLon: number,
): Promise<AQICNStation[]> {
  if (!TOKEN) {
    throw new Error('AQICN API token is not configured');
  }

  const url = `https://api.waqi.info/map/bounds/?token=${TOKEN}&latlng=${minLat},${minLon},${maxLat},${maxLon}`;
  const res = await fetch(url);
  const data: AQICNResponse = await res.json();

  if (data.status === 'ok' && data.data) {
    return data.data.filter((s) => s.lat && s.lon);
  }

  return [];
}

export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#00e400';
  if (aqi <= 100) return '#ffff00';
  if (aqi <= 150) return '#ff7e00';
  if (aqi <= 200) return '#ff0000';
  return '#8f3f97';
}
