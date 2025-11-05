import CONFIG from "../config";
import Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = Leaflet.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
Leaflet.Marker.prototype.options.icon = DefaultIcon;

/**
 * @param {string} mapId
 * @param {function} onLocationChange
 */

export function initMapPicker(mapId, onLocationChange) {
  const initialLat = -6.2088;
  const initialLon = 106.8456;
  const initialZoom = 12;

  const tileLayers = {
    Standard: Leaflet.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ),
    Streets: Leaflet.tileLayer(
      `  https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${CONFIG.MAPTILER_API_KEY}`,
      {
        attribution:
          '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ),
    Satelit: Leaflet.tileLayer(
      `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${CONFIG.MAPTILER_API_KEY}`,
      {
        attribution:
          '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ),
  };

  const map = Leaflet.map(mapId, {
    center: [initialLat, initialLon],
    zoom: initialZoom,
    layers: [tileLayers.Standard],
    scrollWheelZoom: false,
  });

  Leaflet.control.layers(tileLayers).addTo(map);

  onLocationChange(map.getCenter());

  map.on("click", (event) => {
    map.panTo(event.latlng);
  });

  map.on("moveend", () => {
    onLocationChange(map.getCenter());
  });
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        map.setView([userLat, userLon], 20); 
      },

      (error) => {
        console.warn("Gagal mendapatkan lokasi pengguna:", error.message);
      }
    );
  } else {
    console.warn("Geolocation tidak didukung oleh browser ini.");
  }
  return map;
}

/**
 * @param {string} mapId
 * @param {number} lat
 * @param {number} lon
 * @param {string} storyTitle
 */
export function initDetailPageMap(mapId, lat, lon, storyTitle) {
  const map = Leaflet.map(mapId, {
    center: [lat, lon],
    zoom: 15,
    dragging: false,
    scrollWheelZoom: false,
    zoomControl: false,
    doubleClickZoom: false,
    touchZoom: false,
    keyboard: false,
  });

  Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  Leaflet.marker([lat, lon])
    .addTo(map)
    .bindPopup(`Lokasi untuk: ${storyTitle}`);

  return map;
}

/**
 * @param {string} mapId
 * @returns {L.Map}
 */
export function initHomePageMap(mapId) {
  const tileLayers = {
    Standard: Leaflet.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ),

    Streets: Leaflet.tileLayer(
      `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${CONFIG.MAPTILER_API_KEY}`,
      {
        attribution:
          '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ),

    Satelit: Leaflet.tileLayer(
      `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${CONFIG.MAPTILER_API_KEY}`,
      {
        attribution:
          '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ),
  };

  const map = Leaflet.map(mapId, {
    center: [-1, 123.0],
    zoom: 5,
    layers: [tileLayers.Standard],
    scrollWheelZoom: false,
  });

  Leaflet.control.layers(tileLayers).addTo(map);

  return map;
}

export function addMarkersToMap(map, stories, onMarkerClick) {
  const markers = {};
  stories.forEach((story) => {
    if (story.lat && story.lon) {
      const marker = Leaflet.marker([story.lat, story.lon])
        .addTo(map)
        .bindPopup(
          `<b>${story.name || "Anonim"}</b><br>${
            story.description?.substring(0, 30) || ""
          }...`
        );

      markers[story.id] = marker;

      marker.on("click", () => {
        onMarkerClick(marker);
      });
    }
  });
  return markers;
}
