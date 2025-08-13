'use client'
import React from 'react'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from './ui/button'
import { Map } from 'lucide-react'
import { SidebarMenuButton } from './ui/sidebar'

// Google Maps component
const GoogleMap = ({ onLocationSelect, searchQuery, setSearchQuery }) => {
    const mapRef = React.useRef(null);
    const [map, setMap] = React.useState(null);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [currentMarker, setCurrentMarker] = React.useState(null);
    const [geocoder, setGeocoder] = React.useState(null);
    const [placesService, setPlacesService] = React.useState(null);
    const [autocompleteService, setAutocompleteService] = React.useState(null);
    const [predictions, setPredictions] = React.useState([]);
    const [showPredictions, setShowPredictions] = React.useState(false);
    const [selectedPredictionIndex, setSelectedPredictionIndex] = React.useState(-1);

    // Load Google Maps API
    React.useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY;
        
        if (!apiKey) {
            setError('Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAP_KEY in your .env file.');
            return;
        }

        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
            setIsLoaded(true);
            return;
        }

        const script = document.createElement('script');
        // Include places library in the API call
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            setIsLoaded(true);
        };
        
        script.onerror = () => {
            setError('Failed to load Google Maps API');
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup script if component unmounts
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    // Initialize map when API is loaded
    React.useEffect(() => {
        if (isLoaded && mapRef.current && !map) {
            const mapInstance = new window.google.maps.Map(mapRef.current, {
                center: { lat: 42.1015, lng: -72.5898 }, // Springfield, Massachusetts
                zoom: 13,
                mapTypeId: 'roadmap',
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: true,
                fullscreenControl: true,
            });
            
            // Initialize geocoder and places service
            const geocoderInstance = new window.google.maps.Geocoder();
            const placesServiceInstance = new window.google.maps.places.PlacesService(mapInstance);
            const autocompleteServiceInstance = new window.google.maps.places.AutocompleteService();
            
            setGeocoder(geocoderInstance);
            setPlacesService(placesServiceInstance);
            setAutocompleteService(autocompleteServiceInstance);
            
            // Add initial marker
            const initialMarker = new window.google.maps.Marker({
                position: { lat: 42.1015, lng: -72.5898 },
                map: mapInstance,
                title: 'Springfield, Massachusetts',
                draggable: true,
                animation: window.google.maps.Animation.DROP
            });
            
            setCurrentMarker(initialMarker);

            // Function to update marker position and get location info
            const updateMarkerAndLocation = (position, marker) => {
                const lat = position.lat();
                const lng = position.lng();
                
                // Update marker position
                marker.setPosition(position);
                
                // Animate marker
                marker.setAnimation(window.google.maps.Animation.BOUNCE);
                setTimeout(() => {
                    marker.setAnimation(null);
                }, 750);
                
                // Get address from coordinates
                geocoderInstance.geocode(
                    { location: position },
                    (results, status) => {
                        let address = 'Address not found';
                        if (status === 'OK' && results[0]) {
                            address = results[0].formatted_address;
                        }
                        
                        onLocationSelect({
                            lat: lat,
                            lng: lng,
                            address: address
                        });
                    }
                );
            };

            // Handle map clicks - only one marker at a time
            mapInstance.addListener('click', (event) => {
                updateMarkerAndLocation(event.latLng, initialMarker);
            });

            // Handle marker drag
            initialMarker.addListener('dragend', (event) => {
                updateMarkerAndLocation(event.latLng, initialMarker);
            });

            // Set initial location
            geocoderInstance.geocode(
                { location: { lat: 42.1015, lng: -72.5898 } },
                (results, status) => {
                    let address = 'Springfield, Massachusetts';
                    if (status === 'OK' && results[0]) {
                        address = results[0].formatted_address;
                    }
                    
                    onLocationSelect({
                        lat: 42.1015,
                        lng: -72.5898,
                        address: address
                    });
                }
            );

            setMap(mapInstance);
        }
    }, [isLoaded, map, onLocationSelect]);

    // Handle autocomplete predictions
    React.useEffect(() => {
        if (!autocompleteService || !searchQuery.trim()) {
            setPredictions([]);
            setShowPredictions(false);
            return;
        }

        const timer = setTimeout(() => {
            const request = {
                input: searchQuery,
                types: ['establishment', 'geocode'], // Include businesses and addresses
                componentRestrictions: { country: 'us' }, // Optional: restrict to specific country
            };

            autocompleteService.getPlacePredictions(request, (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setPredictions(predictions.slice(0, 5)); // Limit to 5 results
                    setShowPredictions(true);
                    setSelectedPredictionIndex(-1);
                } else {
                    setPredictions([]);
                    setShowPredictions(false);
                }
            });
        }, 300); // Debounce for 300ms

        return () => clearTimeout(timer);
    }, [searchQuery, autocompleteService]);

    // Handle prediction selection
    const selectPrediction = (prediction) => {
        setSearchQuery(prediction.description);
        setShowPredictions(false);
        
        // Get place details and update map
        const request = {
            placeId: prediction.place_id,
            fields: ['name', 'geometry', 'formatted_address']
        };

        placesService.getDetails(request, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
                const location = place.geometry.location;
                const lat = location.lat();
                const lng = location.lng();
                
                // Move map to selected place
                map.setCenter(location);
                map.setZoom(15);
                
                // Move marker
                currentMarker.setPosition(location);
                currentMarker.setAnimation(window.google.maps.Animation.BOUNCE);
                setTimeout(() => {
                    currentMarker.setAnimation(null);
                }, 750);
                
                // Update location info
                onLocationSelect({
                    lat: lat,
                    lng: lng,
                    address: place.formatted_address || place.name || prediction.description
                });
                
                // Clear search query after selection
                setTimeout(() => {
                    setSearchQuery('');
                }, 100);
            }
        });
    };

    // Handle search functionality using Google Places API
    const handleSearch = () => {
        if (!searchQuery || !placesService || !map || !currentMarker) return;

        // First try Places API findPlaceFromQuery for more accurate results
        const request = {
            query: searchQuery,
            fields: ['name', 'geometry', 'formatted_address', 'place_id']
        };

        placesService.findPlaceFromQuery(
            request,
            (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
                    const place = results[0];
                    
                    if (place.geometry && place.geometry.location) {
                        const location = place.geometry.location;
                        const lat = location.lat();
                        const lng = location.lng();
                        
                        // Move map to found place
                        map.setCenter(location);
                        map.setZoom(15);
                        
                        // Move the single marker to the place
                        currentMarker.setPosition(location);
                        currentMarker.setAnimation(window.google.maps.Animation.BOUNCE);
                        setTimeout(() => {
                            currentMarker.setAnimation(null);
                        }, 750);
                        
                        // Update location info with place data
                        onLocationSelect({
                            lat: lat,
                            lng: lng,
                            address: place.formatted_address || place.name || 'Address not available'
                        });
                        
                        // Clear search query
                        setSearchQuery('');
                    }
                } else {
                    // Fallback to regular geocoding if Places API doesn't find the location
                    handleGeocodeSearch();
                }
            }
        );
    };

    // Fallback geocoding search
    const handleGeocodeSearch = () => {
        if (!geocoder || !map || !currentMarker) return;

        geocoder.geocode({ address: searchQuery }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();
                
                // Move map to searched location
                map.setCenter(location);
                map.setZoom(15);
                
                // Move the single marker to searched location
                currentMarker.setPosition(location);
                currentMarker.setAnimation(window.google.maps.Animation.BOUNCE);
                setTimeout(() => {
                    currentMarker.setAnimation(null);
                }, 750);
                
                // Update location info
                onLocationSelect({
                    lat: lat,
                    lng: lng,
                    address: results[0].formatted_address
                });
                
                // Clear search query
                setSearchQuery('');
            } else {
                alert('Location not found. Please try a different search term.');
            }
        });
    };

    // Handle search on Enter key with navigation support
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (showPredictions && selectedPredictionIndex >= 0 && predictions[selectedPredictionIndex]) {
                selectPrediction(predictions[selectedPredictionIndex]);
            } else {
                handleSearch();
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (showPredictions) {
                setSelectedPredictionIndex(prev => 
                    prev < predictions.length - 1 ? prev + 1 : prev
                );
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (showPredictions) {
                setSelectedPredictionIndex(prev => prev > 0 ? prev - 1 : -1);
            }
        } else if (event.key === 'Escape') {
            setShowPredictions(false);
            setSelectedPredictionIndex(-1);
        }
    };

    // Handle input focus
    const handleInputFocus = () => {
        if (searchQuery.trim() && predictions.length > 0) {
            setShowPredictions(true);
        }
    };

    // Handle input blur (with delay to allow clicking on predictions)
    const handleInputBlur = () => {
        setTimeout(() => {
            setShowPredictions(false);
            setSelectedPredictionIndex(-1);
        }, 150);
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                <div className="text-center p-4">
                    <Map className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Map Error</h3>
                    <p className="text-sm text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Loading Google Maps...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Search Bar */}
            <div className="p-4 border-b bg-white relative">
                <div className="flex gap-2 relative">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyPress}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            placeholder="Search for places, businesses, or addresses..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoComplete="off"
                        />
                        
                        {/* Autocomplete Predictions Dropdown */}
                        {showPredictions && predictions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {predictions.map((prediction, index) => (
                                    <div
                                        key={prediction.place_id}
                                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${
                                            index === selectedPredictionIndex ? 'bg-blue-50' : ''
                                        }`}
                                        onClick={() => selectPrediction(prediction)}
                                        onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mt-1 mr-3">
                                                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">
                                                    {prediction.structured_formatting?.main_text || 
                                                     prediction.description.split(',')[0]}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate">
                                                    {prediction.structured_formatting?.secondary_text || 
                                                     prediction.description.split(',').slice(1).join(',').trim()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <Button 
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Search
                    </Button>
                </div>
            </div>
            
            {/* Map Container */}
            <div 
                ref={mapRef} 
                className="flex-1 w-full"
                style={{ minHeight: '500px' }}
            />
        </div>
    );
};

const MapDrawer = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedLocation, setSelectedLocation] = React.useState({
        lat: 42.1015,
        lng: -72.5898,
        address: 'Loading...'
    });
    const [searchQuery, setSearchQuery] = React.useState('');

    const handleLocationSelect = (locationData) => {
        setSelectedLocation(locationData);
    };

    const handleSaveLocation = () => {
        console.log('Final Confirmed Location:', {
            address: selectedLocation.address,
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
            coordinates: `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
        });
        
        // You can also display an alert or toast notification
        alert(`Location Saved!\n\nAddress: ${selectedLocation.address}\nCoordinates: ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`);
        
        // Optionally close the drawer after saving
        setIsOpen(false);
    };

    return (
        <Drawer direction='left' dismissible={false} open={isOpen} onOpenChange={setIsOpen}>
            <SidebarMenuButton asChild tooltip="Map" onClick={() => setIsOpen(true)}>
                <a href="#" className="flex items-center gap-2">
                    <Map />
                    <span>Map</span>
                </a>
            </SidebarMenuButton>
            <DrawerContent className="!w-3/4 !max-w-none h-[90vh] flex flex-col">
                <DrawerHeader className="flex-shrink-0">
                    <DrawerTitle>Map View</DrawerTitle>
                    <DrawerDescription>Search, navigate and select your location on the map.</DrawerDescription>
                </DrawerHeader>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <GoogleMap 
                        onLocationSelect={handleLocationSelect} 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />
                    
                    {/* Location Display */}
                    <div className="flex-shrink-0 p-4 bg-gray-50 border-t">
                        <h3 className="font-medium text-gray-900 mb-2">Selected Location</h3>
                        <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Address:</span> {selectedLocation.address}</p>
                            <p><span className="font-medium">Coordinates:</span> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
                            <p className="text-xs text-gray-500">Click anywhere on the map, drag the marker, or use search to update location</p>
                        </div>
                    </div>
                </div>
                
                <DrawerFooter className="flex-shrink-0">
                    <div className="flex gap-2">
                        <Button
                            onClick={handleSaveLocation}
                            className="bg-green-600 hover:bg-green-700 text-white w-1/2"
                        >
                            Save Location
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="w-1/2"
                        >
                            Close
                        </Button>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default MapDrawer