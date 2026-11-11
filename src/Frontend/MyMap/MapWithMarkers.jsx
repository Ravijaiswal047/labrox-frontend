import React, { useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  OverlayView,
} from "@react-google-maps/api";

const MapWithMarkers = ({ data }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [map, setMap] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const isMouseOverTooltipRef = useRef(false);

  // ✅ Ensure data is always an array
  const dataArray = Array.isArray(data) ? data : [data];

  // ✅ Parse and validate data safely
  const locations = dataArray
    .map((item) => {
      const nameMatch = item?.Title?.match(
        /Phlebotomist Name:\s*(.*?)(?:\n|$)/
      );
      const nameMobile = item?.Title?.match(/Mobile:\s*(.*?)(?:\n|$)/);
      const nameLastSeenTime = item?.Title?.match(
        /Last Seen Time:\s*(.*?)(?:\n|$)/
      );
      const nameBattery = item?.Title?.match(/Battery:\s*(.*?)(?:\n|$)/);
      const nameTemprature = item?.Title?.match(/Temprature:\s*(.*?)(?:\n|$)/);

      const phlebotomistName = nameMatch ? nameMatch[1].trim() : "Unknown";
      const phlebotomistBattery = nameBattery
        ? nameBattery[1].trim()
        : "Unknown";
      const phlebotomistTemp = nameTemprature
        ? nameTemprature[1].trim()
        : "Unknown";
      const phlebotomistMobile = nameMobile ? nameMobile[1].trim() : "Unknown";
      const phlebotomistLastSeenTime = nameLastSeenTime
        ? nameLastSeenTime[1].trim()
        : "Unknown";

      const lat = parseFloat(item?.Latitude);
      const lng = parseFloat(item?.Longitude);

      return {
        id: item?.PhlebotomistID,
        lat: !isNaN(lat) ? lat : null,
        lng: !isNaN(lng) ? lng : null,
        name: phlebotomistName,
        mobile: phlebotomistMobile,
        LastSeenTime: phlebotomistLastSeenTime,
        Battery: phlebotomistBattery,
        Temprature: phlebotomistTemp,
      };
    })
    .filter((loc) => {
      const valid =
        loc.id &&
        loc.lat !== null &&
        loc.lng !== null &&
        !isNaN(loc.lat) &&
        !isNaN(loc.lng) &&
        loc.lat >= -90 &&
        loc.lat <= 90 &&
        loc.lng >= -180 &&
        loc.lng <= 180;

      if (!valid) {
        console.warn("Skipping invalid coordinate:", loc);
      }
      return valid;
    });

  // ✅ Group markers having same coordinates
  const groupedLocations = {};
  locations.forEach((loc) => {
    const key = `${loc.lat.toFixed(6)}-${loc.lng.toFixed(6)}`;
    if (!groupedLocations[key]) {
      groupedLocations[key] = {
        lat: loc.lat,
        lng: loc.lng,
        markers: [],
      };
    }
    groupedLocations[key].markers.push(loc);
  });

  const mapStyles = {
    height: "100vh",
    width: "100%",
  };

  const defaultCenter = {
    lat: 22.9734,
    lng: 78.6569,
  };

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMarkerMouseOver = (group) => {
    clearHoverTimeout();
    setSelectedMarker(group);
    isMouseOverTooltipRef.current = false;
  };

  const handleMarkerMouseOut = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isMouseOverTooltipRef.current) {
        setSelectedMarker(null);
      }
    }, 100);
  };

  const handleTooltipMouseOver = () => {
    clearHoverTimeout();
    isMouseOverTooltipRef.current = true;
  };

  const handleTooltipMouseOut = () => {
    isMouseOverTooltipRef.current = false;
    hoverTimeoutRef.current = setTimeout(() => {
      setSelectedMarker(null);
    }, 200);
  };

  const onLoad = useCallback(
    (map) => {
      setMap(map);
      map.setOptions({
        minZoom: 4,
        maxZoom: 20,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: "greedy",
      });

      if (locations.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        locations.forEach((loc) =>
          bounds.extend({ lat: loc.lat, lng: loc.lng })
        );
        const padding = { top: 50, right: 50, bottom: 50, left: 50 };
        map.fitBounds(bounds, padding);
      }
    },
    [locations]
  );

  const onUnmount = useCallback(() => {
    clearHoverTimeout();
    setMap(null);
  }, []);

  const handleMapClick = () => {
    clearHoverTimeout();
    setSelectedMarker(null);
    isMouseOverTooltipRef.current = false;
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}>
      <GoogleMap
        mapContainerStyle={mapStyles}
        center={defaultCenter}
        zoom={5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          zoomControl: true,
          zoomControlOptions: {
            position: window.google?.maps?.ControlPosition?.RIGHT_CENTER,
          },
        }}
      >
        {Object.entries(groupedLocations).map(([key, group]) => {
          const titleText = group.markers
  .map(
    (m, i) =>
`Name: ${m.name}
Mobile: ${m.mobile}
Battery: ${m.Battery}
Temperature: ${m.Temprature}
Last Seen: ${m.LastSeenTime}`
  )
  .join("\n\n");

            return (
              <Marker
                key={key}
                position={{ lat: group.lat, lng: group.lng }}
                title={titleText}  // <-- native tooltip here
                optimized={false}  // improves tooltip reliability
                icon={{
  url:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect x='0' y='0' width='40' height='40' rx='6' ry='6' fill='white'/%3E%3Cpath fill='%234285F4' d='M20 6c-4.4 0-8 3.6-8 8 0 6 8 16 8 16s8-10 8-16c0-4.4-3.6-8-8-8z'/%3E%3Ccircle cx='20' cy='14' r='3' fill='white'/%3E%3C/svg%3E",
  scaledSize: new window.google.maps.Size(40, 40),
  anchor: new window.google.maps.Point(20, 20),
}}
                label={
                  group.markers.length > 1
                    ? {
                        text: `${group.markers.length}`,
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }
                    : undefined
                }
              />
            );
          })}

      </GoogleMap>
    </LoadScript>
  );
};

export default MapWithMarkers;