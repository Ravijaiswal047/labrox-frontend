import React, { useState, useCallback, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  Polyline,
} from "@react-google-maps/api";

const MapWithMarkersLiveTracking = ({ data, track }) => {

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [map, setMap] = useState(null);
  const [roadPaths, setRoadPaths] = useState([]);
  const [routeInfo, setRouteInfo] = useState([]);

  const dataArray = Array.isArray(data) ? data : data ? [data] : [];
  const trackArray = Array.isArray(track) ? track : track ? [track] : [];

  const phlebotomistMarkers = dataArray
    .map((item) => {
      if (!item) return null;
      try {
        const addressParts = item?.Address?.split("<br/>") || [];
        const nameMatch = addressParts[0] || "Unknown Name";
        const namePhelbo = addressParts[1] || "Unknown Phlebotomist";
        const nameLocation = addressParts[2] || "Unknown Location";

        const lat = parseFloat(item?.Latitude);
        const lng = parseFloat(item?.Longitude);

        const isValidCoordinate =
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180;

        if (!isValidCoordinate) return null;

        return {
          id: item?.PhlebotomistID || `phlebo-marker-${Date.now()}-${Math.random()}`,
          lat,
          lng,
          name: nameMatch,
          Phelbotomist: namePhelbo,
          Location: nameLocation,
          type: "phlebotomist",
          status: item?.Status || "Active",
        };
      } catch (error) {
        console.error("Error processing phlebotomist marker:", error, item);
        return null;
      }
    })
    .filter(Boolean);

  const phleboLocations = trackArray
    .map((item) => {
      if (!item) return null;
      try {
        const lat = parseFloat(item?.Latitude);
        const lng = parseFloat(item?.Longitude);

        const isValidCoordinate =
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180;

        if (!isValidCoordinate) return null;

        return {
          id: item?.LocationID || `location-${Date.now()}-${Math.random()}`,
          lat,
          lng,
          name: item?.LocationName || "Phlebo Location",
          Phelbotomist: item?.PhlebotomistName || item?.Phlebotomist || "Assigned Phlebotomist",
          Address: item?.Address || "Location Address",
          type: "location",
          timestamp: item?.Timestamp ? new Date(item.Timestamp).toISOString() : item?.Timestamp || null,
          locationType: item?.LocationType || "Collection Center",
          raw: item,
        };
      } catch (error) {
        console.error("Error processing phlebo location:", error, item);
        return null;
      }
    })
    .filter(Boolean);

  const allMarkers = [...phlebotomistMarkers, ...phleboLocations];

  const groupedMarkers = {};
  allMarkers.forEach((marker) => {
    const key = `${marker.lat.toFixed(6)}-${marker.lng.toFixed(6)}`;
    if (!groupedMarkers[key]) {
      groupedMarkers[key] = { lat: marker.lat, lng: marker.lng, markers: [] };
    }
    groupedMarkers[key].markers.push(marker);
  });

  // ---- Fetch road paths between phlebotomist and location markers ----
  useEffect(() => {
    if (!window.google?.maps?.DirectionsService || !map) {
      return;
    }

    if (phlebotomistMarkers.length === 0 || phleboLocations.length === 0) {
      return;
    }

    const routePairs = [];
    
    phlebotomistMarkers.forEach((phlebo) => {
      phleboLocations.forEach((location) => {
        routePairs.push({
          start: { lat: phlebo.lat, lng: phlebo.lng },
          end: { lat: location.lat, lng: location.lng },
          phleboName: phlebo.name,
          locationName: location.name,
          phlebotomist: phlebo.Phelbotomist
        });
      });
    });


    if (routePairs.length === 0) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    const fetchRoadPaths = async () => {
      const paths = [];
      const info = [];

      for (let i = 0; i < routePairs.length; i++) {
        const pair = routePairs[i];
        
        try {
          const result = await new Promise((resolve, reject) => {
            directionsService.route(
              {
                origin: new window.google.maps.LatLng(pair.start.lat, pair.start.lng),
                destination: new window.google.maps.LatLng(pair.end.lat, pair.end.lng),
                travelMode: window.google.maps.TravelMode.DRIVING,
              },
              (result, status) => {
                if (status === 'OK') {
                  resolve(result);
                } else {
                  reject(status);
                }
              }
            );
          });

          if (result.routes && result.routes.length > 0) {
            const route = result.routes[0];
            const routePath = [];
            
            route.legs.forEach((leg) => {
              leg.steps.forEach((step) => {
                step.path.forEach((point) => {
                  routePath.push({
                    lat: point.lat(),
                    lng: point.lng()
                  });
                });
              });
            });

            // Extract distance and duration from the route
            const leg = route.legs[0];
            const distance = leg.distance.text; // e.g., "6.5 km"
            const duration = leg.duration.text; // e.g., "15 mins"

            paths.push({
              id: `road-path-${i}`,
              path: routePath,
              phleboName: pair.phleboName,
              locationName: pair.locationName,
              phlebotomist: pair.phlebotomist
            });

            info.push({
              phleboName: pair.phleboName,
              locationName: pair.locationName,
              phlebotomist: pair.phlebotomist,
              distance: distance,
              duration: duration
            });
          }
        } catch (error) {
          paths.push({
            id: `fallback-path-${i}`,
            path: [pair.start, pair.end],
            phleboName: pair.phleboName,
            locationName: pair.locationName,
            phlebotomist: pair.phlebotomist,
            isFallback: true
          });

          // Calculate straight-line distance as fallback
          const R = 6371; // Earth's radius in km
          const dLat = (pair.end.lat - pair.start.lat) * Math.PI / 180;
          const dLng = (pair.end.lng - pair.start.lng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(pair.start.lat * Math.PI / 180) * Math.cos(pair.end.lat * Math.PI / 180) *
                   Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          info.push({
            phleboName: pair.phleboName,
            locationName: pair.locationName,
            phlebotomist: pair.phlebotomist,
            distance: distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`,
            duration: "N/A",
            isFallback: true
          });
        }

        await new Promise(resolve => setTimeout(resolve, 150));
      }

      setRoadPaths(paths);
      setRouteInfo(info);
    };

    fetchRoadPaths();
  }, [phlebotomistMarkers.length, phleboLocations.length, map]);

  const mapStyles = { height: "100vh", width: "100%" };
  const defaultCenter = { lat: 22.9734, lng: 78.6569 };

  const onLoad = useCallback(
    (map) => {
      setMap(map);
      if (map && window.google && window.google.maps) {
        map.setOptions({
          minZoom: 4,
          maxZoom: 18,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        if (allMarkers.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          allMarkers.forEach((marker) => bounds.extend({ lat: marker.lat, lng: marker.lng }));
          map.fitBounds(bounds);
        }
      }
    },
    [allMarkers.length]
  );

  const onUnmount = useCallback(() => setMap(null), []);

  const handleMapClick = () => setSelectedMarker(null);

  const getMarkerIcon = (type) => {
    if (!window.google || !window.google.maps) return null;
    let iconSvg = "";

    if (type === "location") {
      // Green marker for location
      iconSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'%3E%3Cpath fill='%2334A853' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E";
    } else {
      // Blue marker for phlebotomist
      iconSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/%3E%3Ccircle cx='12' cy='9' r='2.5' fill='white'/%3E%3Cpath fill='white' d='M12 11.5c-2 0-3.5 1-3.5 2.5v1h7v-1c0-1.5-1.5-2.5-3.5-2.5z'/%3E%3C/svg%3E";
    }

    return {
      url: iconSvg,
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 40),
    };
  };

  const getLabelColor = (markers) => {
    const hasLocation = markers.some((m) => m.type === "location");
    const hasPhlebotomist = markers.some((m) => m.type === "phlebotomist");
    if (hasLocation && hasPhlebotomist) return "#FBBC05";
    if (hasLocation) return "#34A853";
    return "#4285F4";
  };

  const hasValidMarkers = allMarkers.length > 0;

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
        onError={(error) => console.error("Google Maps API loading error:", error)}
        libraries={["geometry"]}
      >
        <GoogleMap
          mapContainerStyle={mapStyles}
          center={hasValidMarkers ? { lat: allMarkers[0].lat, lng: allMarkers[0].lng } : defaultCenter}
          zoom={hasValidMarkers ? 10 : 5}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
        >
          {Object.entries(groupedMarkers).map(([key, group]) => {
            const iconConfig = group.markers.length === 1 ? getMarkerIcon(group.markers[0].type) : getMarkerIcon("mixed");
            return (
              <Marker
                key={key}
                position={{ lat: group.lat, lng: group.lng }}
                onClick={() => setSelectedMarker(group)}
                icon={iconConfig}
                label={
                  group.markers.length > 1
                    ? {
                        text: `${group.markers.length}`,
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "bold",
                        backgroundColor: getLabelColor(group.markers),
                      }
                    : undefined
                }
              />
            );
          })}

          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div style={{ maxWidth: "300px", maxHeight: "400px", overflowY: "auto", padding: "8px" }}>
                {selectedMarker.markers.length > 1 && (
                  <h4 style={{ color: "#1a73e8", margin: "0 0 8px 0" }}>{selectedMarker.markers.length} Points here</h4>
                )}

                {["phlebotomist", "location"].map((type) => {
                  const filteredMarkers = selectedMarker.markers.filter((m) => m.type === type);
                  if (filteredMarkers.length === 0) return null;
                  return (
                    <div key={type}>
                      {selectedMarker.markers.length > 1 && (
                        <h5 style={{ color: type === "location" ? "#34A853" : "#4285F4", margin: "8px 0 4px 0", fontSize: "14px" }}>
                          {type === "location" ? "Phlebo Locations" : "Phlebotomists"} ({filteredMarkers.length})
                        </h5>
                      )}

                      {filteredMarkers.map((marker, index) => (
                        <div
                          key={marker.id}
                          style={{
                            borderBottom: index < filteredMarkers.length - 1 ? "1px solid #e0e0e0" : "none",
                            padding: "8px 0",
                            borderLeft: `3px solid ${type === "location" ? "#34A853" : "#4285F4"}`,
                            paddingLeft: "8px",
                          }}
                        >
                          <p style={{ margin: "4px 0" }}>
                            <strong>{type === "location" ? "Location:" : "Phlebotomist:"}</strong> {marker.name}
                          </p>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Assigned To:</strong> {marker.Phelbotomist}
                          </p>
                          {type === "location" ? (
                            <>
                              <p style={{ margin: "4px 0" }}>
                                <strong>Address:</strong> {marker.Address}
                              </p>
                              <p style={{ margin: "4px 0" }}>
                                <strong>Type:</strong> {marker.locationType}
                              </p>
                              {marker.timestamp && (
                                <p style={{ margin: "4px 0", fontSize: "12px", color: "#666" }}>
                                  <strong>Updated:</strong> {new Date(marker.timestamp).toLocaleString()}
                                </p>
                              )}
                            </>
                          ) : (
                            <>
                              <p style={{ margin: "4px 0" }}>
                                <strong>Location:</strong> {marker.Location}
                              </p>
                              <p style={{ margin: "4px 0" }}>
                                <strong>Status:</strong> {marker.status}
                              </p>
                            </>
                          )}
                          <p
                            style={{
                              margin: "4px 0",
                              fontSize: "12px",
                              color: type === "location" ? "#34A853" : "#4285F4",
                              fontWeight: "bold",
                            }}
                          >
                            {type === "location" ? "📍 Collection Location" : "👨‍⚕️ Phlebotomist"}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </InfoWindow>
          )}

          {roadPaths.map((roadPath) => (
            <Polyline
              key={roadPath.id}
              path={roadPath.path}
              options={{
                strokeColor: roadPath.isFallback ? "#FFA500" : "#4285F4",
                strokeOpacity: 0.8,
                strokeWeight: 4,
                clickable: true,
                zIndex: 10,
                geodesic: false,
              }}
              onClick={() => {
                console.log(`Route: ${roadPath.phleboName} → ${roadPath.locationName}`);
              }}
            />
          ))}
        </GoogleMap>
      </LoadScript>

      {/* Overlay with route information */}
      {routeInfo.length > 0 && (
        <div style={{
          position: "absolute",
          bottom: "80px",
          left: "20px",
          backgroundColor: "white",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          borderRadius: "8px",
          maxHeight: "calc(100vh - 80px)",
          overflowY: "auto",
          zIndex: 1000,
          minWidth: "320px",
          maxWidth: "400px"
        }}>
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "12px" 
          }}>
            {routeInfo.map((info, index) => (
              <div key={index} style={{
                padding: "12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "6px",
                borderLeft: info.isFallback ? "4px solid #FFA500" : "4px solid #4285F4"
              }}>
                <div style={{ 
                  display: "flex", 
                  flexDirection: "row", 
                  gap: "4px", 
                  fontSize: "13px", 
                  color: "#5f6368" 
                }}>
                  <div>
                    <strong>Distance:</strong> {info.distance}
                  </div>
                  <div>
                    <strong>Estimate Time:</strong> {info.duration}
                  </div>
                  {info.isFallback && (
                    <div style={{ 
                      color: "#FFA500", 
                      fontSize: "11px", 
                      marginTop: "4px",
                      fontStyle: "italic"
                    }}>
                      ⚠ Straight-line distance (route unavailable)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapWithMarkersLiveTracking;