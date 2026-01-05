import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Map, Marker, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import PlacesAutocomplete from "../components/Molecules/PlacesAutocomplete";

const SelectJobLocation = ({ marker, setMarker }) => {
  const [userLocation, setUserLocation] = useState(null);
  const map = useMap();
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({
            lat: latitude,
            lng: longitude,
          });
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to a central location if geolocation fails
          setUserLocation({ lat: 40.7128, lng: -74.006 });
          setLoading(false);
        }
      );
    } else {
      // Fallback for browsers that don't support geolocation
      setUserLocation({ lat: 40.7128, lng: -74.006 });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (map && marker.lat && marker.lng) {
      map.panTo({ lat: marker.lat, lng: marker.lng });
      map.setZoom(15);
    }
  }, [marker, map]);

  // Handle map click to add markers
  const handleMapClick = (e) => {
    if (e.detail.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;

      // Reverse Geocoding
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        const latlng = { lat, lng };

        geocoder.geocode({ location: latlng }, (results, status) => {
          let title = `Job Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`; // Default title
          let state = "";
          if (status === "OK") {
            if (results[0]) {
              title = results[0].formatted_address; // Use the best address
              // Extract state from address components
              const stateComp = results[0].address_components.find((comp) =>
                comp.types.includes("administrative_area_level_1")
              );
              if (stateComp) state = stateComp.long_name;
            } else {
              console.warn("No results found for reverse geocoding");
            }
          } else {
            console.error("Geocoder failed due to: " + status);
          }

          // Create the new marker with the fetched address as the title
          const newMarker = {
            id: Date.now(),
            lat: lat,
            lng: lng,
            title: title,
            state: state,
          };
          setMarker(newMarker);
        });
      } else {
        // Fallback if API isn't ready
        const newMarker = {
          id: Date.now(),
          lat: lat,
          lng: lng,
          title: `Job Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          state: "",
        };
        setMarker(newMarker);
      }
    }
  };

  const handlePlaceSelect = (location) => {
    const { lat, lng, address, state } = location;
    const newMarker = {
      id: Date.now(),
      lat,
      lng,
      title: address,
      state: state || "",
    };
    setMarker(newMarker);
  };

  // Remove marker
  const removeMarker = () => {
    setMarker({});
    setSelectedMarker(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading map...</div>;
  }

  return (
    <div className="w-full ">
      {/* Header */}
      <div className=" mb-2">
        {marker.lat && (
          <div className="space-y-2">
            <div
              className="bg-white p-3 rounded border border-gray-300 flex justify-between items-center cursor-pointer hover:bg-blue-50 transition"
              onClick={() => setSelectedMarker(marker)}
            >
              <div>
                <p className="font-semibold text-sm text-gray-800">{marker.title}</p>
                <p className="text-xs text-gray-500">
                  {marker?.lat?.toFixed(4)}, {marker?.lng?.toFixed(4)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevents the div's onClick from firing
                  removeMarker();
                }}
                className="text-red-500 hover:text-red-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
      <div className=" flex flex-row">
        <div className="   overflow-y-auto"></div>
        <div className="w-full   ">
          <div className="mb-3 w-full h-15">
            <PlacesAutocomplete onSelect={handlePlaceSelect} selectedMarker={marker} />
          </div>
          {userLocation && (
            <Map
              defaultCenter={userLocation}
              defaultZoom={12}
              onClick={handleMapClick}
              gestureHandling={"greedy"}
              reuseMaps={true}
              style={{
                width: "50%",
                height: "400px",
                justifyContent: "center",
                alignSelf: "center",
              }}
            >
              {/* Render job marker */}
              {marker.lat && marker.lng && (
                <Marker
                  position={{ lat: marker.lat, lng: marker.lng }}
                  onClick={() => setSelectedMarker(marker)}
                  title={marker.title}
                />
              )}

              {/* Info Window for Selected Marker */}
              {selectedMarker && (
                <InfoWindow
                  position={{
                    lat: selectedMarker.lat,
                    lng: selectedMarker.lng,
                  }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-3 bg-white rounded shadow-lg">
                    <h3 className="font-bold text-gray-800">{selectedMarker.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Lat: {selectedMarker?.lat?.toFixed(4)}, Lng: {selectedMarker?.lng?.toFixed(4)}
                    </p>
                    <button
                      onClick={() => removeMarker()}
                      className="mt-3 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 w-full transition"
                    >
                      Remove Location
                    </button>
                  </div>
                </InfoWindow>
              )}
            </Map>
          )}
        </div>
      </div>
    </div>
  );
};

SelectJobLocation.propTypes = {
  marker: PropTypes.shape({
    id: PropTypes.number,
    lat: PropTypes.number,
    lng: PropTypes.number,
    title: PropTypes.string,
  }).isRequired,
  setMarker: PropTypes.func.isRequired,
};

export default SelectJobLocation;
