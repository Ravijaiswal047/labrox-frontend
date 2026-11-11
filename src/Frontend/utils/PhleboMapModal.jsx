


import { useMemo, useRef, useCallback, useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";
import { useTranslation } from "react-i18next";

const containerStyle = { width: "100%", height: "520px", borderRadius: 8 };
const DEFAULT_CENTER = { lat: 24.0926251, lng: 88.2536641 };

const PhleboMapModal = ({ show, handleClose, onSuccess, data = [] }) => {
  const { t } = useTranslation();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
  });

  const mapRef = useRef(null);
  const [info, setInfo] = useState(null);
  const [visibleMarkers, setVisibleMarkers] = useState(0);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const points = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    return data
      .map((p, i) => {
        let lat = Number(p.Latitude);
        let lng = Number(p.LongiTude);

        if ((!lat || !lng) && typeof p.latlng === "string") {
          const [latStr, lngStr] = p.latlng.split(/(?=[-]\d+\.\d+$)/);
          lat = Number(latStr);
          lng = Number(lngStr);
        }

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

        return { ...p, lat, lng, index: i };
      })
      .filter(Boolean);
  }, [data]);

  console.log("Points", points)

  useEffect(() => {
    if (!show || !isLoaded || points.length === 0) {
      setVisibleMarkers(0);
      return;
    }

    setVisibleMarkers(1);
    setActiveTooltip(0);

    if (points.length <= 1) {
      const timeout = setTimeout(() => setActiveTooltip(null), 3000);
      return () => clearTimeout(timeout);
    };

    const interval = setInterval(() => {
      setVisibleMarkers((prev) => {
        if (prev >= points.length) {
          clearInterval(interval);
          return prev;
        }

        setActiveTooltip(prev);

        setTimeout(() => {
          setActiveTooltip((current) => current === prev ? null : current);
        }, 3000);

        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);

  }, [show, isLoaded, points.length])

  const onMapLoad = useCallback(
    (map) => {
      mapRef.current = map;
      if (points.length) {
        const bounds = new window.google.maps.LatLngBounds();
        points.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));

        // fit bounds with larger padding (zoom out)
        map.fitBounds(bounds, 400);

         setTimeout(() => {
        map.setZoom(14); // 13 is good for neighborhood/district level
        // Try: 11 = city, 13 = district, 15 = street level
      }, 100);
      }
    },
    [points]
  );

  const panTo = useCallback(({ lat, lng, zoom = 13 }) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(zoom);
    }
  }, []);

  useEffect(() => {
    if (show && onSuccess) onSuccess({ panTo });
  }, [show, onSuccess, panTo]);

  if (loadError)
    return (
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <h5 className="text-center w-100 m-0">
            {t("Error loading Google Maps")}
          </h5>
        </Modal.Header>
      </Modal>
    );

  const displayedPoints = points.slice(0, visibleMarkers);

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" dialogClassName="modal-xxl">
      <Modal.Header closeButton>
        <h5 className="text-center w-100 m-0">
          {t("Phlebotomist map Travel Details")}
        </h5>
      </Modal.Header>

      <Modal.Body style={{ padding: 0 }}>
        <div style={{ width: "100%", height: "520px" }}>
          {!isLoaded ? (
            <div className="p-3 text-center">Loading map…</div>
          ) : (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={points[0] || DEFAULT_CENTER}
              zoom={10}
              onLoad={onMapLoad}
            >
              {displayedPoints.map((p, i) => (
                <Marker
                  key={i}
                  position={{ lat: p.lat, lng: p.lng }}
                  label={{
                    text: `${i + 1}`,
                    color: "white",
                    fontWeight: "700",
                    fontSize: "12px",
                  }}
                  onClick={() => setInfo(p)}
                  animation={window.google?.maps?.Animation?.DROP}
                />
              ))}

              {displayedPoints.length > 1 && (
                <Polyline
                  path={displayedPoints.map((p) => ({ lat: p.lat, lng: p.lng }))}
                  options={{
                    strokeColor: "#d22",
                    strokeOpacity: 0.9,
                    strokeWeight: 4,
                  }}
                />
              )}
              {activeTooltip !== null && displayedPoints[activeTooltip] && (
                <InfoWindow
                  position={{
                    lat: displayedPoints[activeTooltip].lat,
                    lng: displayedPoints[activeTooltip].lng
                  }}
                  onCloseClick={() => setActiveTooltip(null)}
                  options={{
                    pixelOffset: new window.google.maps.Size(0, -40)
                  }}
                >
                  <div style={{ padding: '5px 10px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                     {displayedPoints[activeTooltip].STATUS}
                    </div>
                    <div style={{ fontSize: 13, color: '#333' }}>
                      {displayedPoints[activeTooltip].TravalDate}
                    </div>
                  </div>
                </InfoWindow>
              )}

              {info && (
                <InfoWindow
                  position={{ lat: info.lat, lng: info.lng }}
                  onCloseClick={() => setInfo(null)}
                >
                  <div style={{ minWidth: 180 }}>
                    <div style={{ fontWeight: 700 }}>{`#${info.index + 1}`}</div>
                    <div>{info.STATUS}</div>
                    <div style={{ fontSize: 12, color: "#555" }}>{info.TravalDate}</div>
                    <button
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps?q=${info.lat},${info.lng}`,
                          "_blank",
                          "noopener"
                        )
                      }
                    >
                      {t("Open in Google Maps")}
                    </button>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <button className="btn btn-secondary" onClick={handleClose}>
          {t("Close")}
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (points.length) panTo(points[0]);
          }}
        >
          {t("Center")}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default PhleboMapModal;
