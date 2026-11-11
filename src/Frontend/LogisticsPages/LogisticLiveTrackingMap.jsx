import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { FieldBoyLocation } from "../../assets";
import { useState, useCallback, useEffect } from "react";

const LogisticLiveTrackingMap = ({ tableData }) => {
  const [map, setMap] = useState(null);

  const containerStyle = {
    width: "100%",
    height: "500px",
    borderRadius: "8px",
  };

  const defaultCenter = {
    lat: 28.6139,
    lng: 77.2090,
  };

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  useEffect(() => {
    if (map && tableData?.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasValidCoords = false;

      tableData.forEach((boy) => {
        const lat = parseFloat(boy.Lattitude);
        const lng = parseFloat(boy.Longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          bounds.extend({ lat, lng });
          hasValidCoords = true;
        }
      });

      if (hasValidCoords) {
        map.fitBounds(bounds);

        const listener = window.google.maps.event.addListener(map, "idle", () => {
          if (map.getZoom() > 15) map.setZoom(15);
          window.google.maps.event.removeListener(listener);
        });
      }
    }
  }, [map, tableData]);

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        onLoad={onMapLoad}
        center={defaultCenter}
        zoom={10}
      >

        {tableData?.map((boy) => (
          <Marker
            key={boy.PhlebotomistID}
            position={{
              lat: parseFloat(boy.Lattitude),
              lng: parseFloat(boy.Longitude),
            }}
            icon={
              window.google
                ? {
                    url: FieldBoyLocation,
                    scaledSize: new window.google.maps.Size(40, 40),
                  }
                : null
            }
            title={boy.Title}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default LogisticLiveTrackingMap;