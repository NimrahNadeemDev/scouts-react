export const getLocationFromCoordinates = async (latitude, longitude) => {
  try {
    // In a real app, use reverse geocoding API
    // For now, return a placeholder
    return {
      latitude,
      longitude,
      address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    };
  } catch (error) {
    console.error("Error getting location from coordinates:", error);
    return null;
  }
};

export const requestUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
      },
      (error) => {
        console.error("Error getting user location:", error);
        reject(error);
      }
    );
  });
};

export const getUserLocation = async (setUserLocation, setLoading) => {
  try {
    setLoading(true);
    const coords = await requestUserLocation();
    const location = await getLocationFromCoordinates(coords.latitude, coords.longitude);
    setUserLocation(location);
  } catch (error) {
    console.warn("Could not get user location:", error.message);
    setUserLocation(null);
  } finally {
    setLoading(false);
  }
};
