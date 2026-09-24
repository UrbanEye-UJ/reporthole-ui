/**
 * Turns GPS coordinates into a short human-readable address via OpenStreetMap's Nominatim
 * (free, no API key). Shared by the manual report form and dashcam mode so both send the same
 * `locationAddress` shape to the backend — which never geocodes anything itself, it just stores
 * whatever string it's given (or nothing, which renders as "Unknown location" everywhere).
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "User-Agent": "Reporthole/1.0 (refentsengoako101@gmail.com)" } }
        );
        const data = await res.json();
        const { road, suburb, city, town, village, county } = data.address ?? {};
        const parts = [road, suburb, city ?? town ?? village ?? county].filter(Boolean);
        return parts.join(", ") || data.display_name || null;
    } catch {
        return null;
    }
}

/** Rough metres between two coordinates — good enough to decide "have we moved far enough to re-geocode". */
export function distanceMetres(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
    const R = 6371000;
    const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
    const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
    const s =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((a.latitude * Math.PI) / 180) * Math.cos((b.latitude * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
