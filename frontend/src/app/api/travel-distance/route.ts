import { NextResponse } from "next/server";

type PostcodeLookupResult = {
  result?: {
    latitude?: number;
    longitude?: number;
  };
};

type OsrmRouteResponse = {
  code?: string;
  routes?: Array<{
    distance?: number;
    geometry?: { type?: string; coordinates?: number[][] };
  }>;
};

type TravelDistancePoint = {
  lat: number;
  lon: number;
  label: string;
};

const MILES_PER_KM = 0.621371;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function haversineMiles(
  latA: number,
  lonA: number,
  latB: number,
  lonB: number
): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(latB - latA);
  const dLon = toRadians(lonB - lonA);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(latA)) *
      Math.cos(toRadians(latB)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c * MILES_PER_KM;
}

async function lookupPostcode(postcode: string): Promise<{ lat: number; lon: number }> {
  const response = await fetch(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`
  );
  if (!response.ok) {
    throw new Error("Postcode lookup failed.");
  }
  const payload = (await response.json()) as PostcodeLookupResult;
  const lat = payload.result?.latitude;
  const lon = payload.result?.longitude;
  if (typeof lat !== "number" || typeof lon !== "number") {
    throw new Error("Postcode not found.");
  }
  return { lat, lon };
}

async function drivingRouteOsrm(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): Promise<{ miles: number; lineLatLng: [number, number][] } | null> {
  const path = `${lon1},${lat1};${lon2},${lat2}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as OsrmRouteResponse;
    const route = data.routes?.[0];
    if (data.code !== "Ok" || route?.distance == null) {
      return null;
    }
    const coords = route.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) {
      return null;
    }
    const lineLatLng = coords.map((pair) => {
      const lon = pair[0];
      const lat = pair[1];
      return [lat, lon] as [number, number];
    });
    return { miles: route.distance / 1609.344, lineLatLng };
  } catch {
    return null;
  }
}

function buildPoints(
  fromLabel: string,
  toLabel: string,
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
): { from: TravelDistancePoint; to: TravelDistancePoint } {
  return {
    from: { lat: a.lat, lon: a.lon, label: fromLabel },
    to: { lat: b.lat, lon: b.lon, label: toLabel }
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: { fromPostcode?: string; toPostcode?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const from = body.fromPostcode?.trim() ?? "";
  const to = body.toPostcode?.trim() ?? "";
  if (!from || !to) {
    return NextResponse.json({ error: "Enter both postcodes." }, { status: 400 });
  }

  try {
    const [a, b] = await Promise.all([lookupPostcode(from), lookupPostcode(to)]);
    const points = buildPoints(from, to, a, b);

    const road = await drivingRouteOsrm(a.lon, a.lat, b.lon, b.lat);
    if (road !== null) {
      return NextResponse.json({
        miles: road.miles,
        provider: "osrm" as const,
        ...points,
        lineLatLng: road.lineLatLng
      });
    }

    const miles = haversineMiles(a.lat, a.lon, b.lat, b.lon);
    return NextResponse.json({
      miles,
      provider: "straight_line" as const,
      ...points,
      lineLatLng: [
        [a.lat, a.lon],
        [b.lat, b.lon]
      ] as [number, number][]
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Distance lookup failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
