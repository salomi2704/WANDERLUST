// Leaflet Map Initialization with OpenStreetMap & Client Geocoding
document.addEventListener("DOMContentLoaded", async () => {
  const mapElement = document.getElementById("map");
  if (!mapElement || typeof L === "undefined") {
    return;
  }

  // Ensure listingData is available
  const data = typeof listingData !== "undefined" ? listingData : {};
  const rawCoords = data.coordinates;

  // Default initial coordinates: [lng, lat] in GeoJSON -> [lat, lng] in Leaflet
  let lat = 28.6139;
  let lng = 77.2090;
  let hasValidCoords = false;

  if (
    Array.isArray(rawCoords) &&
    rawCoords.length === 2 &&
    !isNaN(rawCoords[0]) &&
    !isNaN(rawCoords[1])
  ) {
    lng = Number(rawCoords[0]);
    lat = Number(rawCoords[1]);
    hasValidCoords = true;
  }

  // Initialize Leaflet Map
  const map = L.map("map", {
    center: [lat, lng],
    zoom: 12,
    scrollWheelZoom: false,
  });

  // Add OpenStreetMap Tile Layer
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Default Leaflet icon paths
  const defaultIcon = L.icon({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Create Marker
  const marker = L.marker([lat, lng], { icon: defaultIcon }).addTo(map);

  // Create Airbnb-style neighborhood circle
  const circle = L.circle([lat, lng], {
    color: "#fe424d",
    fillColor: "#fe424d",
    fillOpacity: 0.12,
    radius: 1000,
    weight: 1.5,
  }).addTo(map);

  // Create Popup Content
  const popupHtml = `
    <div class="map-popup-content">
      <h6 class="fw-bold mb-1">${data.title || "Listing"}</h6>
      <p class="text-muted small mb-0">${data.location ? data.location + ", " + (data.country || "") : "Exact location provided after booking"}</p>
    </div>
  `;
  marker.bindPopup(popupHtml).openPopup();

  // Helper function to update map position
  function updatePosition(newLat, newLng) {
    lat = newLat;
    lng = newLng;
    map.setView([lat, lng], 12);
    marker.setLatLng([lat, lng]);
    circle.setLatLng([lat, lng]);
    marker.openPopup();
  }

  // Client-side Geocoding fallback/refinement using OpenStreetMap Nominatim
  const locText = (data.location || "").trim();
  const ctryText = (data.country || "").trim();

  // If coordinates are default or need refinement based on location text
  const isDefaultDelhi = Math.abs(lat - 28.6139) < 0.001 && Math.abs(lng - 77.2090) < 0.001;
  const isLocationNotDelhi = locText.toLowerCase() !== "delhi" && locText.toLowerCase() !== "new delhi";

  if ((!hasValidCoords || (isDefaultDelhi && isLocationNotDelhi)) && (locText || ctryText)) {
    const queries = [];
    if (locText && ctryText) queries.push(`${locText}, ${ctryText}`);
    if (locText) queries.push(locText);
    if (ctryText) queries.push(ctryText);

    for (const q of queries) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`
        );
        if (response.ok) {
          const results = await response.json();
          if (Array.isArray(results) && results.length > 0) {
            const foundLat = parseFloat(results[0].lat);
            const foundLng = parseFloat(results[0].lon);
            if (!isNaN(foundLat) && !isNaN(foundLng)) {
              updatePosition(foundLat, foundLng);
              break;
            }
          }
        }
      } catch (err) {
        console.warn("Client geocoding attempt failed:", err);
      }
    }
  }

  // Invalidate map size after layout render
  setTimeout(() => {
    map.invalidateSize();
  }, 250);
});
