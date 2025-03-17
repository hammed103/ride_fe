interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationData {
  coordinates: Coordinates;
  address?: string;
}

// Sample location data for demonstration
const sampleLocations = [
  { name: "Downtown City Center", lat: 40.7128, lng: -74.0060 },
  { name: "Central Park", lat: 40.7812, lng: -73.9665 },
  { name: "Airport Terminal", lat: 40.6413, lng: -73.7781 },
  { name: "Shopping Mall", lat: 40.7516, lng: -73.9755 },
  { name: "University Campus", lat: 40.7291, lng: -73.9965 },
  { name: "Business District", lat: 40.7587, lng: -73.9787 },
  { name: "Residential Area", lat: 40.7282, lng: -73.7949 },
  { name: "Tech Park", lat: 40.7427, lng: -74.0059 },
];

export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

// Enhanced function to get address from coordinates with more realistic addresses
export const getAddressFromCoordinates = async (coordinates: Coordinates): Promise<string> => {
  // In a real app, this would be an API call to a geocoding service like Google Maps
  // For demo purposes, we'll return a realistic-looking address based on proximity to sample locations
  
  // Find the closest sample location
  const closest = findClosestLocation(coordinates);
  
  // Generate a realistic address
  return generateRealisticAddress(closest.name);
};

// Function to search for locations by query string
export const searchLocations = async (query: string): Promise<Array<{name: string, coordinates: Coordinates}>> => {
  // In a real app, this would be an API call to a places API
  // For demo purposes, we'll filter our sample locations
  
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  return sampleLocations
    .filter(loc => loc.name.toLowerCase().includes(lowerQuery))
    .map(loc => ({
      name: loc.name,
      coordinates: { latitude: loc.lat, longitude: loc.lng }
    }));
};

// Format location data for API request
export const formatLocationForApi = (location: LocationData) => {
  return {
    latitude: location.coordinates.latitude,
    longitude: location.coordinates.longitude,
    address: location.address || `${location.coordinates.latitude.toFixed(4)}, ${location.coordinates.longitude.toFixed(4)}`
  };
};

// Helper function to find the closest sample location
function findClosestLocation(coordinates: Coordinates) {
  let closest = sampleLocations[0];
  let closestDistance = calculateDistance(
    coordinates.latitude, 
    coordinates.longitude, 
    closest.lat, 
    closest.lng
  );
  
  for (let i = 1; i < sampleLocations.length; i++) {
    const distance = calculateDistance(
      coordinates.latitude, 
      coordinates.longitude, 
      sampleLocations[i].lat, 
      sampleLocations[i].lng
    );
    
    if (distance < closestDistance) {
      closest = sampleLocations[i];
      closestDistance = distance;
    }
  }
  
  return closest;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

// Generate a realistic-looking address
function generateRealisticAddress(areaName: string) {
  const streetNumbers = [123, 456, 789, 101, 202, 303, 404, 505];
  const streetNames = ["Main St", "Oak Ave", "Maple Rd", "Broadway", "Park Ave", "5th Ave", "Washington Blvd", "Lincoln St"];
  const cities = ["New York", "Brooklyn", "Queens", "Manhattan", "Bronx", "Staten Island"];
  
  const streetNumber = streetNumbers[Math.floor(Math.random() * streetNumbers.length)];
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  
  return `${streetNumber} ${streetName}, ${areaName}, ${city}, NY`;
} 