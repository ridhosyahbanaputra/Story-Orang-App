
import CONFIG from "../config";

const getPlaceName = {
  /**
   * @param {number} lat Latitude
   * @param {number} lon Longitude
   * @returns {string} Nama kota atau lokasi
   */
  async getCityName(lat, lon) {
    const fallbackCoords = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

    if (!lat || !lon) {
      return fallbackCoords;
    }

    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${lon},${lat}.json?key=${CONFIG.MAPTILER_API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data geocoding");
      }

      const responseJson = await response.json();

      if (responseJson.features && responseJson.features.length > 0) {
        const contexts = responseJson.features[0]?.context;

        if (!contexts) {
          return fallbackCoords; 
        }

        const city = contexts.find((ctx) => ctx.id.startsWith("place."));
        if (city) {
          return city.text; 
        }

        const region = contexts.find((ctx) => ctx.id.startsWith("region."));
        if (region) {
          return region.text; 
        }
      }
      return fallbackCoords; 
    } catch (error) {
      console.error("Error di getPlaceName:", error);
      return fallbackCoords; 
    }
  },
};

export default getPlaceName;
