const https = require("https");

function queryNominatimHttps(query) {
  return new Promise((resolve) => {
    const encoded = encodeURIComponent(query);
    const options = {
      hostname: "nominatim.openstreetmap.org",
      path: `/search?format=json&q=${encoded}&limit=1&addressdetails=1`,
      method: "GET",
      headers: {
        "User-Agent": "WanderlustApp/1.0 (contact: info@wanderlust.local)",
        "Accept": "application/json"
      },
      timeout: 6000
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const lat = parseFloat(parsed[0].lat);
              const lon = parseFloat(parsed[0].lon);
              if (!isNaN(lat) && !isNaN(lon)) {
                return resolve({
                  type: "Point",
                  coordinates: [lon, lat] // [lng, lat]
                });
              }
            }
          }
        } catch (e) {
          console.error("Nominatim parse error:", e.message);
        }
        resolve(null);
      });
    });

    req.on("error", (e) => {
      console.error("Nominatim request error:", e.message);
      resolve(null);
    });

    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });

    req.end();
  });
}

async function queryNominatimFetch(query) {
  if (typeof fetch !== "function") return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "WanderlustApp/1.0 (contact: info@wanderlust.local)",
        "Accept": "application/json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          return {
            type: "Point",
            coordinates: [lon, lat] // [lng, lat]
          };
        }
      }
    }
  } catch (err) {
    console.error("Fetch geocode error:", err.message);
  }
  return null;
}

/**
 * Forward geocodes a location query with fallback queries (Location + Country -> Location -> Country)
 * @param {string} location - City/area name
 * @param {string} [country] - Country name
 * @returns {Promise<{type: string, coordinates: [number, number]}>}
 */
async function geocodeLocation(location, country = "") {
  const queries = [];
  const loc = (location || "").trim();
  const ctry = (country || "").trim();

  if (loc && ctry) queries.push(`${loc}, ${ctry}`);
  if (loc) queries.push(loc);
  if (ctry) queries.push(ctry);

  for (const q of queries) {
    let result = await queryNominatimFetch(q);
    if (!result) {
      result = await queryNominatimHttps(q);
    }
    if (result) {
      return result;
    }
  }

  // Default coordinate fallback if no result found (Delhi, India)
  return {
    type: "Point",
    coordinates: [77.2090, 28.6139]
  };
}

module.exports = { geocodeLocation };
